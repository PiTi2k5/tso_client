var Menu = function(type){
	this.groupedMenu = function() {
		return [
			{ label: loca.GetText("ACL", "BuffAdventuresGeneral"), items: [ 
				{ label: loca.GetText("LAB", "ToggleOptionsPanel"), onSelect: mainSettingsHandler },
				{ label: loca.GetText("LAB", "Filter"), onSelect: menuFilterHandler, items: [
						{ label: "none" }, { label: "snownowater" }, { label: "snowlight" },
						{ label: "snow" }, { label: "oven" }, { label: "doomsday" },
						{ label: "night" }, { label: "desert" }, { label: "tropical" },
						{ label: "blackandwhite" }, { label: "spooky" }, { label: "snow_medium" },
						{ label: "tundra" }, { label: "darkershadow" }, { label: "magicsepia" }
				]}, 
				{ label: loca.GetText("LAB", "Update") + ' ', keyEquivalent: 'F2', keyCode: 113, defaultKeyEquivalentModifiers: false, onSelect: menuZoneRefreshHandler}
			]},
			{ label: loca.GetText("LAB", "Specialists"), items: [ 
				{ label: loca.GetText("SPE", "Explorer") + ' ', keyEquivalent: 'F3', keyCode: 114, defaultKeyEquivalentModifiers: false, onSelect: function() { specSharedHandler(1); } }, 
				{ label: loca.GetText("SPE", "Geologist") + ' ', keyEquivalent: 'F4', keyCode: 115, defaultKeyEquivalentModifiers: false, onSelect: function() { specSharedHandler(2); } }
			]},
			{ label: loca.GetText("LAB", "Buildings"), items: [
				{ label: loca.GetText("LAB", "Buffs") + ' ', keyEquivalent: 'F5', keyCode: 116, defaultKeyEquivalentModifiers: false, onSelect: menuBuffsHandler }, 
				{ label: loca.GetText("LAB", "Production") + ' ', keyEquivalent: 'F7', keyCode: 118, defaultKeyEquivalentModifiers: false, onSelect: menuBuildingHandler },
				{ label: getText('prod_timed') + ' ', keyEquivalent: 'F8', keyCode: 119, defaultKeyEquivalentModifiers: false, onSelect: TimedMenuHandler }
			]},
			{ label: loca.GetText("LAB", "BlackMarketAuction") + ' ', defaultKeyEquivalentModifiers: false, keyEquivalent: 'F6', keyCode: 117, onSelect: menuAuctionHandler },
			{ label: loca.GetText("RES", "Tool"), name: 'Tools', items: [ 
				{label: loca.GetText("LAB", "Update"), onSelect: reloadScripts }, 
				{label: loca.GetText("LAB", "ToggleOptionsPanel"), onSelect: scriptsManager },
				{type: 'separator' }
			]}
		];
	};
	this.linearMenu = function(){var e=[],r=this.groupedMenu();for(i in r)if(r[i].items&&"Tools"!=r[i].name)for(n in r[i].items)e.push(r[i].items[n]);else e.push(r[i]);return e};
	this.type = type;
	this.nativeMenu = null;
	this.keybindings = {};
};
Menu.prototype = {
	show:function(){
		this.keybindings = {};
		var menu = this.type == 'grouped' ? this.groupedMenu() : this.linearMenu();
		if(isDebug) {
			menu.push({ label: "CustomCode", onSelect: menuCustomHandler });
			menu.push({ label: "SaveHTML", onSelect: menuSaveHandler });
		}
		menu.push({ label: 'v' + version, enabled: false });
		air.ui.Menu.setAsMenu(air.ui.Menu.createFromJSON(menu), true);
		this.nativeMenu = window.nativeWindow.menu;
		this.buildKeybinds(menu);
	},
	buildKeybinds: function(menu){
		for(i in menu) {
			if(menu[i].items) {
				this.buildKeybinds(menu[i].items);
				continue;
			}
			if(menu[i].keyCode)
				this.addKeybBind(menu[i].onSelect, menu[i].keyCode, false, false);
		}
	},
	addKeybBind: function(fn, key, ctrl, isUser) {
		keyComb = key.toString() + (ctrl ? ctrl : false).toString();
		if (this.keybindings[keyComb]) {
			  alert(keyComb + " already binded");
			  return;
		}
		this.keybindings[keyComb] = { 'isUser': isUser, 'fn': fn };
	},
	checkKeybind: function(event) {
		var keyComb = '{0}{1}'.format(event.keyCode.toString(), event.ctrlKey.toString());
		if(this.keybindings[keyComb])
			this.keybindings[keyComb].fn(null);
	},
	createItem: function(name, fn) {
		var item = new air.NativeMenuItem(name);
		item.addEventListener(air.Event.SELECT, fn);
		return item;
	},
	addToolsItem: function(name, fn, key, ctrl) {
		this.nativeMenu.getItemByName("Tools").submenu.addItem(this.createItem(name, fn));
		if(key) { this.addKeybBind(fn, key, ctrl, true); }
	},
	clearTools: function() {
		$('script[id="user"]').remove();
		var toolsMenu = this.nativeMenu.getItemByName("Tools").submenu;
		while(toolsMenu.numItems > 3) { toolsMenu.removeItemAt(3); }
		for(i in this.keybindings) { 
			this.keybindings[i].isUser&&delete this.keybindings[i];
		}
	}
};
menu = new Menu(mainSettings.menuStyle);
menu.show();
reloadScripts(null);
