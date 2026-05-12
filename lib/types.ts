export type SupportingDocument = {
  id: string;
  originalName: string;
  storedName: string;
  mimeType: string;
  size: number;
  uploadedAt: string;
};

export type Registration = {
  referenceCode: string;
  passwordHash: string;
  name: string;
  email: string;
  phone: string;
  organization: string;
  jobTitle: string;
  ticketType: string;
  dietaryNeeds: string;
  accessibilityNeeds: string;
  emergencyContact: string;
  notes: string;
  documents: SupportingDocument[];
  createdAt: string;
  updatedAt: string;
};

export type PublicRegistration = Omit<Registration, "passwordHash">;
