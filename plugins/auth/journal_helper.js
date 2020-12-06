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
    
    login(data) {
        if (data.type == 'local') {
            return `Вход в систему с локальной учетной записью`;
        } else if (data.type == 'ad') {
            return `Вход в систему с учетной записью AD`;
        } else {
            return '';
        }
    }

    login_attepmt(data) {
        return `Попытка входа в систему под логином "${data.username}" с ip-адреса "${data.ip}"`;
    }

    logout(data) {
        return 'Выход из системы';
    }

    blocked(data) {
        return `Пользователь "${data.username}" и ip "${data.ip}" временно заблокированы для авторизации`;
    }
    
    register(data) {
        return `Регистрация пользователя ID:${data.id} ${data.email} с ip-адреса "${data.ip}"`;
    }

}