module.exports = class {

    constructor(helper) {
        this.helper = helper;
    }

    parseActions(action, data) {
        let pdata = this.parseJsonData(data);
        if (typeof this[action] != 'undefined') {
            return this[action](pdata);
        } else {
            return '';
        }
    }

    parseJsonData(data) {
        try {
            let pdata = JSON.parse(data);
            return pdata;
        } catch(e) {
            return {};
        }
    }
    
    userState(data) {
        if (data.state == 0) {
            return `Выключение пользователя ID:${data.id}`;
        } else {
            return `Включение пользователя ID:${data.id}`;
        }
        
    }

    deleteUser(data) {
        return `Удаление пользователя "${data.fio}" ID:${data.id}`;
    }

    addUser(data) {
        return `Добавление пользователя "${data.name}" ID:${data.id} ${data.email}`;
    }

    editUser(data) {
        return `Редактирование пользователя ID:${data.id}`;
    }

    addGroup(data) {
        return `Добавление группы "${data.name}" ID:${data.id}`;
    }

    deleteGroup(data) {
        return `Удаление группы ID:${data.id}`;
    }

    editGroup(data) {
        return `Редактирование наименования группы "${data.name}" ID:${data.id}`;
    }

    editPermissions(data) {
        if (data.state == 0) {
            return `Удаление прав у группы ID:${data.group_id} "${data.plugin} | ${data.function}"`;
        } else {
            return `Предоставление прав для группы ID:${data.group_id} "${data.plugin} | ${data.function}"`;
        }
        
    }

}