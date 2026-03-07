import { z } from "zod";

const stockFields = z.object({
  type: z.literal("stock"),
  ticker: z.string().min(1, "Ticker is required").max(10),
  stockQuantity: z.number().positive("Quantity must be positive"),
  purchasePrice: z.number().positive("Purchase price must be positive"),
  purchaseDate: z.string().optional(),
});

const cryptoFields = z.object({
  type: z.literal("crypto"),
  coinSymbol: z.string().min(1, "Coin symbol is required").max(20),
  cryptoQuantity: z.number().positive("Quantity must be positive"),
  avgBuyPrice: z.number().positive("Average buy price must be positive"),
  walletExchange: z.string().max(100).optional(),
});

const realEstateFields = z.object({
  type: z.literal("real_estate"),
  propertyName: z.string().min(1, "Property name is required").max(200),
  address: z.string().max(500).optional(),
  realEstatePurchasePrice: z.number().positive("Purchase price must be positive"),
  estimatedValue: z.number().positive("Estimated value must be positive"),
  propertyType: z.string().max(50).optional(),
  ownershipPercentage: z.number().min(0).max(100).optional(),
  linkedDebtId: z.string().optional(),
});

export const createAssetSchema = z.object({
  body: z.discriminatedUnion("type", [stockFields, cryptoFields, realEstateFields]),
});

export const updateAssetSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({
    ticker: z.string().min(1).max(10).optional(),
    stockQuantity: z.number().positive().optional(),
    purchasePrice: z.number().positive().optional(),
    purchaseDate: z.string().optional(),
    coinSymbol: z.string().min(1).max(20).optional(),
    cryptoQuantity: z.number().positive().optional(),
    avgBuyPrice: z.number().positive().optional(),
    walletExchange: z.string().max(100).optional(),
    propertyName: z.string().min(1).max(200).optional(),
    address: z.string().max(500).optional(),
    realEstatePurchasePrice: z.number().positive().optional(),
    estimatedValue: z.number().positive().optional(),
    propertyType: z.string().max(50).optional(),
    ownershipPercentage: z.number().min(0).max(100).optional(),
    linkedDebtId: z.string().nullable().optional(),
  }),
});
