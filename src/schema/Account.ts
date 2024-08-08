import { model, ObjectId, Schema } from "mongoose";

export interface IAccount {
    id: string;
    balance: number;
    currentCompanyID: String;
};

const schema = new Schema<IAccount>({
    id: { type: String, required: true },
    balance: { type: Number, default: 0 },
    currentCompanyID: { type: String, required: false }
});

const Account = model<IAccount>("Account", schema);
export default Account;