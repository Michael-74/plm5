var Tabs = {
	all_tabs: {},
	last_tab_id: 1,
	createTab(tabid, url) {
		Tabs.all_tabs['tab_'+tabid] = {
			id: tabid,
			url: url,
			back:'',
			title: '',
			plugin: '',
			unsaved: false,
			actions: [],
			scroll: 0,
			elements: []
		};
	},
	newTab(url) {
		var tabid = Tabs.last_tab_id++;
		Tabs.createTab(tabid, url);
		Tabs._getReq(url, function(data) {
			Tabs._unactiveAll();
			$('.tabs').append('<div class="tab tab-active" data-tabid="'+tabid+'"><div class="row"><div class="col-12"><div class="tab__content">'+data.content+'</div></div></div></div>');
			$('<li class="active"><span class="tab_link" title="'+data.title+'" data-tabid="'+tabid+'" onclick="Tabs.selectTab('+tabid+');">'+data.title+'</span><span class="tab_close" onclick="Tabs.closeTab(this, '+tabid+');"></span></li>').insertBefore($('.tab_selector_add'));
			Tabs.defineTabData(tabid, data);
			Tabs.setTitleActions(tabid);
		});
	},
	refreshTab(id) {
		var ct_data = Tabs.all_tabs['tab_'+id];
		Tabs.sameTab(ct_data.url);
	},
	sameTab(url, fromHistory) {
		var tabid = Tabs._currentTabId();
		Tabs._checkUnsaved(tabid, function(){
			Tabs.createTab(tabid, url);
			Tabs._getReq(url, function(data) {
				Tabs.defineTabData(tabid, data);
				$('.tab.tab-active .tab__content').html(data.content);
				$('.tab_selector li.active .tab_link').html(data.title);
				$('.tab_selector li.active .tab_link').attr('title', data.title);
				if (typeof fromHistory == 'undefined') {
					Tabs.setTitleActions(tabid);
				} else {
					Tabs.setTitleActions(tabid, true);
				}
				
			});
		});
	},
	selectTab(tabid) {
		var li_container = $('.tab_link[data-tabid="'+tabid+'"]').parent('li');
		if ($(li_container).hasClass('active') === false) {
			Tabs._unactiveAll();
			$(li_container).addClass('active');
			$('.tab[data-tabid="'+tabid+'"]').addClass('tab-active');
			Tabs.setTitleActions(tabid);
			document.querySelector('.layout-top_content').scrollTop = Tabs.all_tabs['tab_'+tabid].scroll;
		}
		Tabs.checkIfChecked(tabid);
	},
	defineTabData(tabid, data) {
		$('.tab.tab-active').data('plugin', data.plugin);
		$('.tab.tab-active').attr('plugin', data.plugin);
		Tabs.all_tabs['tab_'+tabid].title = data.title;
		Tabs.all_tabs['tab_'+tabid].actions = data.actions;
		Tabs.all_tabs['tab_'+tabid].plugin = data.plugin;
		Tabs.all_tabs['tab_'+tabid].back = data.back;
	},
	setTitleActions(tabid, fromHistory) {
		$('.layout-top_header .layout-top_header_title').html(Tabs.all_tabs['tab_'+tabid].back+Tabs.all_tabs['tab_'+tabid].title);
		$('.layout-top_header .content_top__actions').html('');
		for (let i in Tabs.all_tabs['tab_'+tabid].actions) {
			$('.layout-top_header .content_top__actions').append(Tabs.all_tabs['tab_'+tabid].actions[i]);
		}
		Menu._activeMenu(tabid);
		if (typeof fromHistory == 'undefined') {
			history.pushState(Tabs.all_tabs['tab_'+tabid], Tabs.all_tabs['tab_'+tabid].title, Tabs.all_tabs['tab_'+tabid].url);
		}
		document.title = Tabs.all_tabs['tab_'+tabid].title;
	},
	closeTab(that, id) {
		Tabs._checkUnsaved(id, function(){
			$(that).parent('li').remove();
			$('.tab[data-tabid="'+id+'"]').remove();
			delete Tabs.all_tabs['tab_'+id];
			let cnt = Object.keys(Tabs.all_tabs).length;
			if (cnt == 0) {
				Tabs.newTab('/');
			} else {
				let last_tab_id = Object.keys(Tabs.all_tabs)[parseInt(Object.keys(Tabs.all_tabs).length - 1)].split('_')[1];
				Tabs.selectTab(last_tab_id);
			}
		});
	},
	_saveScroll(scrolltop) {
		var tabid = Tabs._currentTabId();
		if (typeof Tabs.all_tabs['tab_'+tabid] != 'undefined') {
			Tabs.all_tabs['tab_'+tabid].scroll = scrolltop;
		}
	},
	_currentTabId() {
		return $('.tab.tab-active').attr('data-tabid');
	},
	_checkUnsaved(tabid, callback) {
		if (Tabs.all_tabs['tab_'+tabid].unsaved == true) {
			swal({
				title: 'Внимание!',
				text: 'На странице имеются несохраненные данные. Вы уверены, что хотите покинуть страницу?',
				type: "warning",
				showCancelButton: true,
				confirmButtonColor: "#DD6B55",
				confirmButtonText: 'Да, выйти без сохранения',
				cancelButtonText: 'Отмена',
				closeOnConfirm: true,
				closeOnCancel: true
			},
			function (isConfirm) {
				if (isConfirm === true) {
					if (callback) callback();
				}
			});
		} else {
			callback();
		}
	},
	_setUnsaved() {
		var tabid = Tabs._currentTabId();
		Tabs.all_tabs['tab_'+tabid].unsaved = true;
	},
	_unsetUnsaved() {
		var tabid = Tabs._currentTabId();
		Tabs.all_tabs['tab_'+tabid].unsaved = false;
	},
	_unactiveAll() {
		$('.tab_selector li').removeClass('active');
		$('.tabs .tab').removeClass('tab-active');
	},
	_getReq(href, cb) {
		$.get(href, function(data) {
			if (cb) cb(data);
		}, 'json');
	},
	_updateCurrent(dop, cb) {
		var tabid = Tabs._currentTabId();
		Tabs._getReq(Tabs.all_tabs['tab_'+tabid].url+(typeof dop != 'undefined' ? dop : ''), function(data) {
			$('.tab.tab-active .tab__content').html(data.content);
			if (cb) cb();
		});
	},
	checkIfChecked(tabid) {
		if (Tabs.all_tabs['tab_'+tabid].elements.length > 0) {
			$('.if_checked').css('display', 'initial');
		} else {
			$('.if_checked').css('display', 'none');
		}
	},
	checkElement(th, id) {
		var tabid = Tabs._currentTabId();
		var cur_tr = $('.tab.tab-active .table .table__tbody tr[data-id="'+id+'"]');
		if (th.checked == true) {
			$(cur_tr).addClass('checked');
			if (Tabs.all_tabs['tab_'+tabid].elements.includes(id) == false) {
				Tabs.all_tabs['tab_'+tabid].elements.push(id);
			}
		} else {
			$(cur_tr).removeClass('checked');
			if (Tabs.all_tabs['tab_'+tabid].elements.includes(id) == true) {
				if (Tabs.all_tabs['tab_'+tabid].elements.indexOf(id) > -1) Tabs.all_tabs['tab_'+tabid].elements.splice(Tabs.all_tabs['tab_'+tabid].elements.indexOf(id), 1);
			}
		}
		Tabs.checkIfChecked(tabid);
	},
	deselectAllCheckElement() {
		var tabid = Tabs._currentTabId();
		Tabs.all_tabs['tab_'+tabid].elements = [];
		Tabs.checkIfChecked(tabid);
	}
}

var Menu = {
	openMain(is_new) {
		if (is_new == true) {
			Tabs.newTab('/');
		} else {
			Tabs.sameTab('/');
		}
		return false;
	},
	getData(callback) {
		$.get('/main/menu', function(data) {
			callback(data.menu);
		}, 'json');
	},
	build() {
		Menu.getData(function(menu_data) {
			$('.layout-top_menu-list').html('<li class="logo-menu-icon" onclick="Menu.openMain(false);"><img src="/include/img/menu_logo.png" /></li>');
			for (var i in menu_data) {
				var item = menu_data[i];
				var onclick = (item.onclick != false ? ' onclick="'+item.onclick+'"' : (item.ajax==true?' onclick="Tabs.sameTab(\''+item.link+'\');return false;"':''))
				$('.layout-top_menu-list').append('<li data-plugin="'+item.plugin+'"><a aria-label="'+item.title+'" class="hint--right" title="'+item.title+'" href="'+item.link+'"'+onclick+'><i class="'+item.icon+'"></i></a></li>');
			}
		});
	},
	_activeMenu(id) {
		if (Tabs.all_tabs['tab_'+id].plugin) {
			Menu._unactiveMenu();
			$('.layout-top_menu-list li[data-plugin="'+Tabs.all_tabs['tab_'+id].plugin+'"]').addClass('active');
		}
	},
	_unactiveMenu() {
		$('.layout-top_menu-list li').removeClass('active');
	}
}

var DSH = {
	// Замена дефолтной функции обновления страницы по нажатию [F5]
	changeF5(e) {
		if ((e.which || e.keyCode) == 116) {
			e.preventDefault();
			Tabs.refreshTab(Tabs._currentTabId());
			DSH.showInfo('Обновление','Контент страницы обновлен...');
		}
	},
	// Запрос перед удалением
	deleteConfirm(title, text, cancelButtonText, confirmButtonTex, callback) {
		swal({
			title: title,
			text: text,
			type: "warning",
			showCancelButton: true,
			confirmButtonColor: "#DD6B55",
			confirmButtonText: confirmButtonTex,
			cancelButtonText: cancelButtonText,
			closeOnConfirm: true,
			closeOnCancel: true
		},
		function (isConfirm) {
			if (isConfirm === true) {
				if (callback) callback();
			}
		});
	},
	showInfo(title, msg) {
		toastr.warning(msg);
	},
	showInfo2(title, msg) {
		toastr.info(msg, title);
	}
}

$(function() {

	$(document).on('keydown', DSH.changeF5);

	jQuery.extend(jQuery.validator.messages, {
		required:"Поле обязательно для заполнения",
		remote:"Пожалуйста, исправьте значение в поле.",
		email:"Введите адрес электронной почты",
		url:"Введите валидный URL.",
		date:"Введенное значение не является датой.",
		dateISO:"Введенное значение не является датой в формате IS).",
		number:"Поле должно содержать число",
		digits:"Вводите только цифры."
	});

	$.modal.defaults.showClose = false;
	$.modal.defaults.clickClose = false;

	toastr.options = {
		"closeButton": false,
		"debug": false,
		"newestOnTop": false,
		"progressBar": true,
		"positionClass": "toast-top-right",
		"preventDuplicates": true,
		"onclick": null,
		"showDuration": "500",
		"hideDuration": "500",
		"timeOut": "1000",
		"extendedTimeOut": "1000",
		"showEasing": "swing",
		"hideEasing": "linear",
		"showMethod": "fadeIn",
		"hideMethod": "fadeOut"
	}

});

window.addEventListener('popstate', function(e) {
	if (typeof e.state != 'undefined') {
		if (typeof e.state.url != 'undefined') {
			Tabs.sameTab(e.state.url, true);
		}
	}
});



document.querySelector('.layout-top_content').addEventListener("scroll", function(event) {
	Tabs._saveScroll(this.scrollTop);
});


Number.prototype.format = function(n, x, s, c) {
	var re = '\\d(?=(\\d{' + (x || 3) + '})+' + (n > 0 ? '\\D' : '$') + ')',
		num = this.toFixed(Math.max(0, ~~n));

	return (c ? num.replace('.', c) : num).replace(new RegExp(re, 'g'), '$&' + (s || ','));
};