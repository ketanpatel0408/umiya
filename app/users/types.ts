export type UserRole = "ADMIN" | "USER";

export type ManagedUser = {
  id: number;
  username: string;
  fullName: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  lastLoginAt: string | null;
  sellerName: string | null;
  sellerPhone: string | null;
  sellerAddress: string | null;
  sellerGSTIN: string | null;
  sellerPAN: string | null;
  sellerState: string | null;
  sellerStateCode: string | null;
};

export type SellerDetailsForm = {
  sellerName: string;
  sellerPhone: string;
  sellerAddress: string;
  sellerGSTIN: string;
  sellerPAN: string;
  sellerState: string;
  sellerStateCode: string;
};

export function emptySellerDetails(): SellerDetailsForm {
  return {
    sellerName: "",
    sellerPhone: "",
    sellerAddress: "",
    sellerGSTIN: "",
    sellerPAN: "",
    sellerState: "",
    sellerStateCode: "",
  };
}
