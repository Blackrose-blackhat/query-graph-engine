"""Database schema definition and connection management."""

import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "data.db")

SCHEMA_SQL = """
-- Drop tables respecting dependencies (children first)
DROP TABLE IF EXISTS sales_order_items;
DROP TABLE IF EXISTS billing_document_headers;
DROP TABLE IF EXISTS outbound_delivery_headers;
DROP TABLE IF EXISTS sales_order_headers;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS business_partners;

-- Old legacy schema drops
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS invoices;
DROP TABLE IF EXISTS deliveries;
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS customers;
DROP TABLE IF EXISTS addresses;

CREATE TABLE business_partners (
    businessPartner TEXT PRIMARY KEY,
    customer TEXT,
    businessPartnerFullName TEXT,
    businessPartnerGrouping TEXT,
    businessPartnerUUID TEXT,
    organizationBPName1 TEXT
);

CREATE TABLE sales_order_headers (
    salesOrder TEXT PRIMARY KEY,
    salesOrderType TEXT,
    salesOrganization TEXT,
    distributionChannel TEXT,
    organizationDivision TEXT,
    salesGroup TEXT,
    salesOffice TEXT,
    salesDistrict TEXT,
    soldToParty TEXT,
    creationDate TEXT,
    createdByUser TEXT,
    lastChangeDate TEXT,
    salesOrderDate TEXT,
    totalNetAmount REAL,
    transactionCurrency TEXT,
    pricingDate TEXT,
    requestedDeliveryDate TEXT,
    shippingCondition TEXT,
    completeDeliveryIsDefined TEXT,
    incotermsClassification TEXT,
    incotermsLocation1 TEXT,
    FOREIGN KEY (soldToParty) REFERENCES business_partners(businessPartner)
);

CREATE TABLE products (
    product TEXT PRIMARY KEY,
    productType TEXT,
    crossPlantStatus TEXT,
    crossPlantStatusValidityDate TEXT,
    creationDate TEXT,
    createdByUser TEXT,
    lastChangeDate TEXT,
    lastChangedByUser TEXT,
    isMarkedForDeletion TEXT,
    productOldID TEXT,
    grossWeight REAL,
    purchaseOrderQuantityUnit TEXT,
    sourceOfSupply TEXT,
    weightUnit TEXT,
    netWeight REAL,
    countryOfOrigin TEXT,
    competitorID TEXT,
    productGroup TEXT,
    baseUnit TEXT,
    itemCategoryGroup TEXT,
    netWeight_2 REAL,
    productHierarchy TEXT,
    division TEXT,
    varblPurOrdUnitIsActive TEXT,
    volumeUnit TEXT,
    materialVolume REAL,
    anpCode TEXT,
    brand TEXT,
    procurementRule TEXT,
    validityStartDate TEXT,
    lowLevelCode TEXT,
    prodNoInGenProdInPrepackProd TEXT,
    serialIdentifierAssgmtProfile TEXT,
    sizeOrDimensionText TEXT,
    industryStandardName TEXT,
    productStandardID TEXT,
    internationalArticleNumberCat TEXT,
    productIsConfigurable TEXT,
    isBatchManagementRequired TEXT,
    hasEmptiesBOM TEXT,
    externalProductGroup TEXT,
    crossPlantConfigurableProduct TEXT,
    serialNoExplicitnessLevel TEXT,
    productManufacturerNumber TEXT,
    manufacturerNumber TEXT,
    manufacturerPartProfile TEXT
);

CREATE TABLE sales_order_items (
    salesOrder TEXT,
    salesOrderItem TEXT,
    salesOrderItemCategory TEXT,
    material TEXT,
    requestedQuantity REAL,
    requestedQuantityUnit TEXT,
    transactionCurrency TEXT,
    netAmount REAL,
    materialGroup TEXT,
    productionPlant TEXT,
    storageLocation TEXT,
    salesDocumentRjcnReason TEXT,
    itemBillingBlockReason TEXT,
    PRIMARY KEY (salesOrder, salesOrderItem),
    FOREIGN KEY (salesOrder) REFERENCES sales_order_headers(salesOrder),
    FOREIGN KEY (material) REFERENCES products(product)
);

CREATE TABLE outbound_delivery_headers (
    deliveryDocument TEXT PRIMARY KEY,
    actualGoodsMovementDate TEXT,
    creationDate TEXT,
    deliveryBlockReason TEXT,
    hdrGeneralIncompletionStatus TEXT,
    headerBillingBlockReason TEXT,
    lastChangeDate TEXT,
    overallGoodsMovementStatus TEXT,
    overallPickingStatus TEXT,
    overallProofOfDeliveryStatus TEXT,
    shippingPoint TEXT
);

CREATE TABLE billing_document_headers (
    billingDocument TEXT PRIMARY KEY,
    billingDocumentType TEXT,
    creationDate TEXT,
    lastChangeDateTime TEXT,
    billingDocumentDate TEXT,
    billingDocumentIsCancelled BOOLEAN,
    cancelledBillingDocument TEXT,
    totalNetAmount REAL,
    transactionCurrency TEXT,
    companyCode TEXT,
    fiscalYear TEXT,
    accountingDocument TEXT,
    soldToParty TEXT,
    FOREIGN KEY (soldToParty) REFERENCES business_partners(businessPartner)
);
"""

# Explicit schema metadata for validation
TABLES = {
    "business_partners": ["businessPartner", "customer", "businessPartnerFullName", "businessPartnerGrouping", "businessPartnerUUID", "organizationBPName1"],
    "sales_order_headers": ["salesOrder", "salesOrderType", "salesOrganization", "distributionChannel", "organizationDivision", "salesGroup", "salesOffice", "salesDistrict", "soldToParty", "creationDate", "createdByUser", "lastChangeDate", "salesOrderDate", "totalNetAmount", "transactionCurrency", "pricingDate", "requestedDeliveryDate", "shippingCondition", "completeDeliveryIsDefined", "incotermsClassification", "incotermsLocation1"],
    "products": ["product", "productType", "crossPlantStatus", "crossPlantStatusValidityDate", "creationDate", "createdByUser", "lastChangeDate", "lastChangedByUser", "isMarkedForDeletion", "productOldID", "grossWeight", "purchaseOrderQuantityUnit", "sourceOfSupply", "weightUnit", "netWeight", "countryOfOrigin", "competitorID", "productGroup", "baseUnit", "itemCategoryGroup", "netWeight_2", "productHierarchy", "division", "varblPurOrdUnitIsActive", "volumeUnit", "materialVolume", "anpCode", "brand", "procurementRule", "validityStartDate", "lowLevelCode", "prodNoInGenProdInPrepackProd", "serialIdentifierAssgmtProfile", "sizeOrDimensionText", "industryStandardName", "productStandardID", "internationalArticleNumberCat", "productIsConfigurable", "isBatchManagementRequired", "hasEmptiesBOM", "externalProductGroup", "crossPlantConfigurableProduct", "serialNoExplicitnessLevel", "productManufacturerNumber", "manufacturerNumber", "manufacturerPartProfile"],
    "sales_order_items": ["salesOrder", "salesOrderItem", "salesOrderItemCategory", "material", "requestedQuantity", "requestedQuantityUnit", "transactionCurrency", "netAmount", "materialGroup", "productionPlant", "storageLocation", "salesDocumentRjcnReason", "itemBillingBlockReason"],
    "outbound_delivery_headers": ["deliveryDocument", "actualGoodsMovementDate", "creationDate", "deliveryBlockReason", "hdrGeneralIncompletionStatus", "headerBillingBlockReason", "lastChangeDate", "overallGoodsMovementStatus", "overallPickingStatus", "overallProofOfDeliveryStatus", "shippingPoint"],
    "billing_document_headers": ["billingDocument", "billingDocumentType", "creationDate", "lastChangeDateTime", "billingDocumentDate", "billingDocumentIsCancelled", "cancelledBillingDocument", "totalNetAmount", "transactionCurrency", "companyCode", "fiscalYear", "accountingDocument", "soldToParty"]
}

RELATIONSHIPS = [
    ("business_partners", "businessPartner", "sales_order_headers", "soldToParty", "PLACED"),
    ("sales_order_headers", "salesOrder", "sales_order_items", "salesOrder", "CONTAINS"),
    ("sales_order_items", "material", "products", "product", "OF_PRODUCT"),
    ("business_partners", "businessPartner", "billing_document_headers", "soldToParty", "BILLED_TO"),
]


def get_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def init_db():
    conn = get_connection()
    conn.executescript(SCHEMA_SQL)
    conn.commit()
    conn.close()
