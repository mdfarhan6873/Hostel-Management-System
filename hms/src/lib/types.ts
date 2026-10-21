export type Role = "superadmin" | "warden" | "viewer" | "student";

export type StudentStatus = "WAITING" | "ALLOTTED" | "CANCELLED";

export interface IUser {
  _id?: string;
  name: string;
  email: string;
  mobile: string;
  password?: string;
  role: "superadmin" | "warden" | "viewer";
  assignedCategory?: string; // e.g. "Boys Hostel" | "Girls Hostel"
  designation?: string;
  status?: "ACTIVE" | "INACTIVE";
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IParents {
  fatherName: string;
  motherName: string;
  parentMobile: string;
}

export interface IDocumentLink {
  title: string;
  url: string;
}

export interface IStudent {
  _id?: string;
  fullName: string;
  email: string;
  mobile: string;
  password?: string;
  age: number;
  completeAddress: string;
  bloodGroup?: string;

  // Academic Details
  rollNo: string;
  branch: string;
  session: string; // e.g. "2025-2029"
  registrationNo?: string;

  // Hostel & Documents
  messCardNo?: string;
  documentLinks?: IDocumentLink[];

  // Parents Details
  parents: IParents;

  // Lifecycle Status
  status: StudentStatus;

  // Allocated Infrastructure Details
  hostelId?: string;
  blockId?: string;
  floorId?: string;
  roomId?: string;
  furnitureGroupName?: string;
  assignedBedId?: string;
  assignedTableId?: string;
  assignedChairId?: string;

  // Eviction / Removal Notice
  evictionRemark?: string;
  evictionNoticeLink?: string;
  evictedAt?: Date;

  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICustomAsset {
  name: string;
  number: string;
  isAvailable?: boolean;
}

export interface IFurnitureGroup {
  _id?: string;
  groupName: string; // e.g. "Group A", "Group B"
  bedId?: string;    // e.g. "BED-101-A"
  bedAvailable?: boolean; // default true
  tableId?: string;  // e.g. "TAB-101-A"
  tableAvailable?: boolean; // default true
  chairId?: string;  // e.g. "CHR-101-A"
  chairAvailable?: boolean; // default true
  customAssets?: ICustomAsset[]; // e.g. [{ name: "Almirah", number: "ALM-101-A", isAvailable: true }]
  isOccupied?: boolean;
  occupiedBy?: string; // studentId
  occupiedStudentName?: string;
  occupiedStudentRoll?: string;
  occupiedStudentBranch?: string;
  occupiedStudentSession?: string;
  groupStatus?: "AVAILABLE" | "ASSET_UNAVAILABLE" | "MAINTENANCE";
}

export interface IRoom {
  _id?: string;
  roomNumber: string;
  floorId: string;
  blockId: string;
  hostelId: string;
  capacity: number; // 1, 2, 3
  roomType: "Single" | "Double" | "Triple" | string;
  furnitureGroups: IFurnitureGroup[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IFloor {
  _id?: string;
  name: string; // e.g. "Ground Floor", "1st Floor"
  floorNumber: number;
  blockId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IBlock {
  _id?: string;
  name: string; // e.g. "Block A", "Block B"
  hostelId: string;
  wardenId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IHostel {
  _id?: string;
  name: string; // e.g. "Boys Hostel", "Girls Hostel"
  code?: string; // e.g. "BH-GEC-MGR"
  type: "boys" | "girls" | "coed" | string;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IBill {
  _id?: string;
  studentId: string;
  wardenId: string;
  title: string;
  billType: "mess" | "rent" | "maintenance" | "fine" | string;
  billingPeriod: string; // e.g. "August 2026" or "Jan-July 2026"
  baseAmount: number;
  leaveDaysRebate: number;
  rebateAmount: number;
  netAmount: number;
  dueDate: Date;
  status: "PENDING" | "PAID";
  paidAt?: Date;
  receiptNumber?: string;
  transactionId?: string;
  paymentMethod?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ILeaveRequest {
  _id?: string;
  studentId: string;
  startDate: Date;
  endDate: Date;
  daysCount: number;
  reason: string;
  handwrittenApplicationUrl?: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  reviewedBy?: string;
  reviewedAt?: Date;
  rejectionReason?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IAdmissionNotice {
  _id?: string;
  title: string;
  description: string;
  category: "ADMISSION" | "CIRCULAR" | "BLUEPRINT" | "REBATE" | "MAINTENANCE" | "GENERAL";
  refNumber: string;
  publishDate: Date;
  pdfLinks: { label: string; url: string; isFormLink?: boolean; formId?: string }[];
  visibility?: FormVisibility;
  isActive: boolean;
  createdBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type CustomFormFieldType =
  | "text"
  | "textarea"
  | "number"
  | "checkbox"
  | "select"
  | "radio"
  | "date"
  | "datetime"
  | "file"
  | "email"
  | "phone";

export type FormType = "ADMISSION" | "REALLOCATION" | "MAINTENANCE" | "NOTICE" | "GENERAL";

export type FormVisibility = "PUBLIC" | "ENROLLED_STUDENTS" | "ALLOTTED_STUDENTS";

export type FormStatus = "DRAFT" | "ACTIVE" | "CLOSED" | "ARCHIVED";

export interface ICustomFormField {
  id: string;
  label: string;
  fieldType: CustomFormFieldType;
  required: boolean;
  placeholder?: string;
  helpText?: string;
  options?: string[]; // for select, radio
  order?: number;
}

export interface ICustomForm {
  _id?: string;
  title: string;
  description: string;
  formType: FormType;
  startDate: Date | string;
  endDate: Date | string;
  visibility: FormVisibility;
  status: FormStatus;
  fields: ICustomFormField[];
  createdBy?: string;
  hostelCategory?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type ResponseStatus = "PENDING" | "UNDER_REVIEW" | "APPROVED" | "REJECTED";

export interface IFormResponseItem {
  fieldId: string;
  label: string;
  value: any;
  fieldType: CustomFormFieldType | string;
}

export interface IApplicantInfo {
  name: string;
  email: string;
  phone: string;
  rollNo?: string;
  branch?: string;
  session?: string;
}

export interface IFormResponse {
  _id?: string;
  formId: string;
  formTitle: string;
  formType: FormType;
  submittedBy?: string; // studentId if logged in
  applicantInfo: IApplicantInfo;
  responses: IFormResponseItem[];
  status: ResponseStatus;
  wardenNotes?: string;
  reviewedBy?: string;
  reviewedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

