let userModel = require("../schemas/users");
module.exports = {
    CreateAnUser: async function (username, password, email, role,
        fullName, avatarUrl, status, loginCount
    ) {
        console.log('Creating user with the following details:');
        console.log('Username:', username);
        console.log('Password (hashed):', password);
        console.log('Email:', email);
        console.log('Role:', role);

        let newItem = new userModel({
            username: username,
            password: password,
            email: email,
            fullName: fullName,
            avatarUrl: avatarUrl,
            status: status,
            role: role,
            loginCount: loginCount
        });

        await newItem.save();
        console.log('User successfully saved to database:', newItem);
        return newItem;
    },
    GetAllUser: async function () {
        let users = await userModel
            .find({ isDeleted: false })
        return users;
    },
    GetAnUserByUsername: async function (username) {
        let user = await userModel
            .findOne({
                isDeleted: false,
                username: username
            })
        return user;
    },
    GetAnUserById: async function (id) {
        let user = await userModel
            .findOne({
                isDeleted: false,
                _id: id
            })
        return user;
    }

}