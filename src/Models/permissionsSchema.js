const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Permission Schema
const permissionSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    description: {
        type: String,
    },
});

// Permission Model
const Permission = mongoose.model("Permission", permissionSchema);

module.exports = Permission;
