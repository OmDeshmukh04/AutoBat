import {
  calculateWarranty,
  DRAFT_WARRANTY_POLICIES,
  type WarrantyCalculation,
  type WarrantyPreviewInput
} from "@autobat/contracts";
import { Injectable, NotFoundException } from "@nestjs/common";

export type WarrantyPreviewResponse = {
  serialNumber: string;
  productName: string;
  policyIsDraft: boolean;
  calculation: WarrantyCalculation;
};

@Injectable()
export class WarrantyService {
  listDraftPolicies() {
    return DRAFT_WARRANTY_POLICIES;
  }

  preview(
    input: WarrantyPreviewInput,
    asOfDate: string
  ): WarrantyPreviewResponse {
    const policy = DRAFT_WARRANTY_POLICIES.find(
      (candidate) => candidate.id === input.policyId
    );

    if (!policy) {
      throw new NotFoundException("Warranty policy not found");
    }

    return {
      serialNumber: input.serialNumber,
      productName: policy.productName,
      policyIsDraft: policy.isDraft,
      calculation: calculateWarranty({
        policy,
        purchaseDate: input.purchaseDate,
        activationDate: asOfDate,
        asOfDate
      })
    };
  }
}

