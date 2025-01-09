const Role = require("../Models/roleSchema");
const User = require("../Models/userSchema");
const token = require("../Utils/token");

const checkPermissions = (permissionName, action) => {
    return async (req, res, next) => {
      try {
        userId = await token.getLoggedUserId(req,res); 
        
        const user = await User.findById(userId).populate("role");

        if (!user) {
            return res.status(404).send();
        }

        const role = await Role.findOne({ name: user.role.name }).populate("permissions");
        
        const permission = role.permissions.find(
          (perm) => perm.name === permissionName
        );

        if(!permission){
          return res.status(400).send('user has no permission to access resource');
        }
        console.log(permission)
        next();
      } catch (err) {
        next(err);
      }
    };
};



  

module.exports = checkPermissions;
