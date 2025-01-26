const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    phone: {
        type: String,
        required: true,
    },
    password: {
        type: String,
    },
    role: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Role",
        required: false,
    },
    situation: {
        type: String,
        default: "Pendente",
    },
    cancelDate:{
        type: Date,
    },
    justification:{
        type: String,
    },
    status: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
    isProtected: {
        type: Boolean,
        default: false,
    },
});

userSchema.set("toJSON", {
    transform: (doc, ret) => {
        delete ret.password;
        return ret;
    },
});

userSchema.set("toObject", {
    transform: (doc, ret) => {
        delete ret.password;
        return ret;
    },
});

// userSchema.pre("save", async function (next) {
//     if (!this.role) {
//         try {

//             const defaultRole = await Role.findOne({ name: "Usuário" });
//             if (defaultRole) {
//                 this.role = defaultRole._id;
//             }
//         } catch (error) {
//             return next(error);
//         }
//     }
//     next();
// });

const User = mongoose.model("User", userSchema);

module.exports = User;
