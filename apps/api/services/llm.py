"""LLM service for SQL generation with strict prompt control."""

import os
import httpx
from dotenv import load_dotenv

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
MODEL = "llama-3.3-70b-versatile"

SYSTEM_PROMPT = """You are a strict data query translator for a business system.

Your job is to convert natural language questions into valid SQL queries.

You must follow these rules strictly:

1. ONLY use the provided database schema.
2. DO NOT assume any columns or tables that are not listed.
3. DO NOT hallucinate relationships.
4. DO NOT generate explanations or text.
5. OUTPUT ONLY the SQL query, nothing else. No markdown, no code fences, no comments.
6. If the query is unrelated to the schema or you cannot answer it with the schema, output exactly: INVALID_QUERY

DATABASE SCHEMA:

Tables:
  business_partners(businessPartner, customer, businessPartnerFullName, businessPartnerGrouping, businessPartnerUUID, organizationBPName1)
  sales_order_headers(salesOrder, salesOrderType, salesOrganization, distributionChannel, organizationDivision, salesGroup, salesOffice, salesDistrict, soldToParty, creationDate, createdByUser, lastChangeDate, salesOrderDate, totalNetAmount, transactionCurrency, pricingDate, requestedDeliveryDate, shippingCondition, completeDeliveryIsDefined, incotermsClassification, incotermsLocation1)
  products(product, productType, crossPlantStatus, crossPlantStatusValidityDate, creationDate, createdByUser, lastChangeDate, lastChangedByUser, isMarkedForDeletion, productOldID, grossWeight, purchaseOrderQuantityUnit, sourceOfSupply, weightUnit, netWeight, countryOfOrigin, competitorID, productGroup, baseUnit, itemCategoryGroup, netWeight_2, productHierarchy, division, varblPurOrdUnitIsActive, volumeUnit, materialVolume, anpCode, brand, procurementRule, validityStartDate, lowLevelCode, prodNoInGenProdInPrepackProd, serialIdentifierAssgmtProfile, sizeOrDimensionText, industryStandardName, productStandardID, internationalArticleNumberCat, productIsConfigurable, isBatchManagementRequired, hasEmptiesBOM, externalProductGroup, crossPlantConfigurableProduct, serialNoExplicitnessLevel, productManufacturerNumber, manufacturerNumber, manufacturerPartProfile)
  sales_order_items(salesOrder, salesOrderItem, salesOrderItemCategory, material, requestedQuantity, requestedQuantityUnit, transactionCurrency, netAmount, materialGroup, productionPlant, storageLocation, salesDocumentRjcnReason, itemBillingBlockReason)
  outbound_delivery_headers(deliveryDocument, actualGoodsMovementDate, creationDate, deliveryBlockReason, hdrGeneralIncompletionStatus, headerBillingBlockReason, lastChangeDate, overallGoodsMovementStatus, overallPickingStatus, overallProofOfDeliveryStatus, shippingPoint)
  billing_document_headers(billingDocument, billingDocumentType, creationDate, lastChangeDateTime, billingDocumentDate, billingDocumentIsCancelled, cancelledBillingDocument, totalNetAmount, transactionCurrency, companyCode, fiscalYear, accountingDocument, soldToParty)

RELATIONSHIPS:
  business_partners.businessPartner = sales_order_headers.soldToParty
  sales_order_headers.salesOrder = sales_order_items.salesOrder
  sales_order_items.material = products.product
  business_partners.businessPartner = billing_document_headers.soldToParty

EXAMPLES:

User: Which business partners have the highest number of billing documents?
SQL:
SELECT bp.businessPartnerFullName, COUNT(b.billingDocument) as billing_count
FROM business_partners bp
JOIN billing_document_headers b ON bp.businessPartner = b.soldToParty
GROUP BY bp.businessPartnerFullName
ORDER BY billing_count DESC;

User: What is the total net amount for sales orders by business partner?
SQL:
SELECT bp.businessPartnerFullName, SUM(soh.totalNetAmount) as total_amount
FROM business_partners bp
JOIN sales_order_headers soh ON bp.businessPartner = soh.soldToParty
GROUP BY bp.businessPartnerFullName
ORDER BY total_amount DESC;

User: Show all products in sales order 740506
SQL:
SELECT p.product, p.productType, soi.requestedQuantity
FROM sales_order_items soi
JOIN products p ON soi.material = p.product
WHERE soi.salesOrder = '740506';

Now convert the following user query into SQL. Output ONLY the SQL or INVALID_QUERY."""


async def generate_sql(user_query: str) -> str:
    """Send user query to Groq LLM and get SQL back."""
    if not GROQ_API_KEY:
        raise ValueError("GROQ_API_KEY not set. Add it to backend/.env")

    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json",
    }

    payload = {
        "model": MODEL,
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_query},
        ],
        "temperature": 0,
        "max_tokens": 500,
    }

    async with httpx.AsyncClient(timeout=30) as client:
        response = await client.post(GROQ_URL, json=payload, headers=headers)
        response.raise_for_status()

    data = response.json()
    raw = data["choices"][0]["message"]["content"].strip()

    # Strip markdown code fences if LLM wraps output
    if raw.startswith("```"):
        lines = raw.split("\n")
        # Remove first and last fence lines
        lines = [l for l in lines if not l.startswith("```")]
        raw = "\n".join(lines).strip()

    return raw
