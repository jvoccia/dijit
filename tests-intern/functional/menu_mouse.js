define([
    'intern!object',
    'intern/chai!assert',
    'require',
    'dojo/_base/array',
    'dojo/node!leadfoot/keys',
    'dojo/node!leadfoot/helpers/pollUntil'
], function (registerSuite, assert, require, array, keys, pollUntil) {

    /* There appears to be a concurrency issue in this code. */
    /* Running 1 browser at a time until fixed */

    var command;
    var classContains = function (classAttribute, className){
        var classes = (classAttribute || "").split(' ');
        return (array.indexOf(classes, className) >= 0);
    };

    var registerHandlerScript = function(id, event) {
        var script =
             "var  \n" +
             "{id} = window.dijit.registry.byId('{id}'), \n" +
             "handler = {id}.on('{event}', function(){ \n" +
             "      handler.remove(); \n" +
             "      window.handlerCallback = '{id}-on{event}'; \n" +
             "}); return true";

        return script.replace(/\{id\}/g, id).replace(/\{event\}/g, event);
    };

    registerSuite({
        name: 'dijit.MenuBar mouse tests',

        'setup': function() {
            command = this.remote.get(require.toUrl('./support/test_Menu.html'))
                            .then(pollUntil("return window.setupComplete;"));
        },
        'teardown': function () {
            command = null;
        },


        'mouse over file MenuBarItem': function () {
            return command
                // Check initial conditions
                .findById('file')
                    .getAttribute('class').then(function (classAttribute){
                        assert.isFalse(classContains(classAttribute, 'dijitMenuItemHover'),
                            "File MenuBarItem doesn't have hover effect");
                    })
                .end()
                .findById('fileMenu')
                    .isDisplayed().then(function (displayed){
                        assert.isFalse(displayed, "File menu is hidden");
                    })
                .end()
                // Move over the File MenuBarItem
                .findById('file')
                    .moveMouseTo()
                    .getAttribute('class').then(function (classAttribute){
                        // The "File" MenuBarItem should be highlighted
                        assert.isTrue(classContains(classAttribute, 'dijitMenuItemHover'),
                            "File MenuBarItem should have hover effect, actual class is: " + classAttribute);
                    })
                .end()
                .findById('fileMenu')
                    .isDisplayed().then(function (displayed){
                        // However, just moving over the MenuBarItem shouldn't have opened the menu
                        assert.isFalse(displayed, "File menu is hidden");
                    })
                .end();
        },
        'click on file MenuBarItem': function () {
            return command
                .findById('file')
                    .moveMouseTo()
                    .click()
                    .getAttribute('class').then(function (classAttribute){
                        // The "File" MenuBarItem should have the selected class in addition to the hover
                        // class
                        assert.isTrue(classContains(classAttribute, 'dijitMenuItemHover'),
                            "File MenuBarItem should have hover effect, actual class is: " + classAttribute);
                        assert.isTrue(classContains(classAttribute, 'dijitMenuItemSelected'),
                            "File MenuBarItem should have selected class, actual class is: " + classAttribute);
                    })
                .end()
                .findById('fileMenu')
                    .isDisplayed().then(function (displayed){
                        assert(displayed, "File menu is visible");
                    })
                .end()
                .findById('new')
                    .getAttribute('class').then(function (classAttribute){
                        // But the first item in the file menu should not be selected, since we opened via mouse not keyboard (#10716)
                        assert.isFalse(classContains(classAttribute, 'dijitMenuItemSelected'),
                            "New MenuItem should not have selected class, actual class is: " + classAttribute);
                    })
                .end();
        },
        'hover edit menu item': function () {
            return command
                .findById('edit')
                    .moveMouseTo()
                .end()
                .findById('editMenu')
                    .isDisplayed().then(function (displayed){
                        // Since we've already activated the MenuBar by clicking "File",
                        // hovering over "Edit" should automatically show the edit menu
                        assert.isTrue(displayed, "Edit menu is visible");
                    })
                .end()
                .findById('fileMenu')
                    .isDisplayed().then(function (displayed){
                        // And also, the file menu should have disappeared
                        assert.isFalse(displayed, "File menu is hidden");
                    })
                .end();
        },
        'move to copy': function () {
            return command
                .findById('copy')
                    .moveMouseTo()
                .end()
                .findById('edit')
                .getAttribute('class').then(function (classAttribute){
                    assert.isFalse(classContains(classAttribute, 'dijitMenuItemHover'),
                        "Edit MenuBarItem shouldn't have hover effect anymore, actual class is: " + classAttribute);
                    assert.isTrue(classContains(classAttribute, 'dijitMenuItemSelected'),
                        "Edit MenuBarItem should still have selected class, actual class is: " + classAttribute);
                })
                .end()
                .findById('copy')
                    .getAttribute('class').then(function (classAttribute){
                        assert.isTrue(classContains(classAttribute, 'dijitMenuItemHover'),
                            "Copy Menu item should have hover effect, actual class is: " + classAttribute);
                        assert.isTrue(classContains(classAttribute, 'dijitMenuItemSelected'),
                            "Copy Menu item should have selected effect, actual class is: " + classAttribute);
                    })
                .end();
        },
        'click copy': function () {
            return command
                .findById('copy')
                    .click()
                .end()
                .findById('editMenu')
                    .isDisplayed().then(function (displayed){
                        assert.isFalse(displayed, "edit menu disappeared");
                    })
                .end()
                .findById('edit')
                    .getAttribute('class').then(function (classAttribute){
                        assert.isFalse(classContains(classAttribute, 'dijitMenuItemSelected'),
                            "Edit MenuBarItem should no longer have selected effect, actual class is: " + classAttribute);
                    })
                .end();
        },
        'mouse over file MenuBarItem again': function () {
            return command
                .findById('file')
                    .getAttribute('class').then(function (classAttribute){
                        assert.isFalse(classContains(classAttribute, 'dijitMenuItemHover'), "File MenuBarItem doesn't have hover effect");
                    })
                .end()
                .findById('fileMenu')
                    .isDisplayed().then(function (displayed){
                        assert.isFalse(displayed, "File menu is hidden");
                    })
                .end()
                .findById('file')
                    // Move over the File MenuBarItem
                    .moveMouseTo()
                    .getAttribute('class').then(function (classAttribute){
                        // The "File" MenuBarItem should be highlighted
                        assert.isTrue(classContains(classAttribute, 'dijitMenuItemHover'),
                            "File MenuBarItem should have hover effect, actual class is: " + classAttribute);

                        // However, it shouldn't be "selected", and
                        // just moving over the MenuBarItem shouldn't have opened the menu,
                        // given that after clicking above, the MenuBar should have reverted to it's
                        // "dormant" state so that it needs to be clicked again before menus show up automatically
                        assert.isFalse(classContains(classAttribute, 'dijitMenuItemSelected'),
                            "File MenuBarItem shouldn't have selected effect, actual class is: " + classAttribute);

                    })
                .end()
                .findById('fileMenu')
                    .isDisplayed().then(function (displayed){
                        assert.isFalse(displayed, "File menu is hidden");
                    })
                .end();
            }
    });
    registerSuite({
        name: 'Navigation menu mouse tests',

        'setup': function() {
            command = this.remote.get(require.toUrl('./support/test_Menu.html'))
                            .then(pollUntil("return window.setupComplete;"));
        },
        'teardown': function () {
            command = null;
        },
        'mouse over enabled submenu': function () {
            return command
                // Check initial conditions
                .findById('navMenuPopupItem1')
                    .getAttribute('class').then(function (classAttribute){
                        assert.isFalse(classContains(classAttribute, 'dijitMenuItemHover'), "navMenuPopupItem1 MenuItem doesn't have hover effect");
                    })
                .end()
                .findById('navMenuSub1')
                    .isDisplayed().then(function (displayed){
                        assert.isFalse(displayed, "sub menu is hidden");
                    })
                .end()
                .findById('navMenuPopupItem1')
                    .moveMouseTo()
                    .getAttribute('class').then(function (classAttribute){
                        assert.isTrue(classContains(classAttribute, 'dijitMenuItemHover'),
                            "'Enabled Submenu' MenuItem should have hover effect, actual class is: " + classAttribute);
                    })
                .end()
                .findById('navMenuSub1')
                    .isDisplayed().then(function (displayed){
                        assert.isFalse(displayed, "sub menu is hidden");
                    })
                .end();
        },
        'open submenu': function () {
            return command
                .findById('navMenuPopupItem1')
                    .click()
                    // Check initial conditions
                    .getAttribute('class').then(function (classAttribute){
                        assert.isTrue(classContains(classAttribute, 'dijitMenuItemHover'),
                            "'Enabled Submenu' MenuItem should have hover effect, actual class is: " + classAttribute);
                        assert.isTrue(classContains(classAttribute, 'dijitMenuItemSelected'),
                            "'Enabled Submenu' MenuItem should have selected effect, actual class is:  " + classAttribute);
                    })
                .end()
                .findById('navMenuSub1')
                    .isDisplayed().then(function (displayed){
                        // And the sub menu should be visible
                        assert.isTrue(displayed, "sub menu is visible");
                    })
                .end()
                .findById('navMenuSub1_item1')
                    .getAttribute('class').then(function (classAttribute){
                        // But the first item in the sub menu should NOT be selected, since opened by mouse, see #10716
                        assert.isFalse(classContains(classAttribute, 'dijitMenuItemSelected'),
                            "first item in sub menu should not be selected class when opened by mouse, actual class is: " + classAttribute);
                    })
                .end();
        },
        'toggle CheckedMenuItem': function () { // Using "isSelected" was failing to detect checked
            return command
                .execute("return window.dijit.registry.byId('checked2').get('checked')")
                    .then(function(checked) {
                        assert.isFalse(checked, "not initially checked");
                	})
                .findById('checked2')
                    .moveMouseTo()
                    .click()
                .end()
                .execute("return window.dijit.registry.byId('checked2').get('checked')")
                    .then(function(checked) {
                        assert.isTrue(checked, "now it's checked");
                	});
        }
    });
    registerSuite({
        name: 'Context menu mouse tests',

        'setup': function() {
            command = this.remote.get(require.toUrl('./support/test_Menu.html'))
                            .then(pollUntil("return window.setupComplete;"));
        },
        'teardown': function () {
            command = null;
        },

        'open global context menu (mouse)': function (){
            var inputCoords, menuCoords;
            return command
                .findById('windowContextMenu')
                    .isDisplayed().then(function (displayed){
                        assert.isFalse(displayed, "menu should be initially hidden");
                    })
                .end()
                .findById('input')
                    .moveMouseTo()
                    .clickMouseButton(2)
                .end()
                .findById('windowContextMenu')
                    .isDisplayed().then(function (displayed){
                        assert.isTrue(displayed, "menu is now shown");
                    })
                .end()
                .findById('input')
                    .getPosition().then(function(pos){
                        inputCoords = pos;
                    }).getSize().then(function(size){
                        inputCoords.h = size.height;
                        inputCoords.w = size.width;
                    })
                .end()
                .findById('windowContextMenu')
                    .getPosition().then(function(pos){
                        menuCoords = pos;

                        assert.isTrue(menuCoords.x > inputCoords.x, "to right of link left edge");
                        assert.isTrue(menuCoords.x < inputCoords.x + inputCoords.w, "to left of link right edge");
                        assert.isTrue(menuCoords.y > inputCoords.y, "menu (" + menuCoords.y + ") starts below top of link (" + inputCoords.y + ")");
                        assert.isTrue(menuCoords.y < inputCoords.y + inputCoords.h, "menu (" + menuCoords.y + ") starts above bottom of link (" + inputCoords.y + "+" + inputCoords.h + ")");

                    })
                .end()
                .findById('windowContextMenuFirstChoice')
                    .getAttribute('class').then(function (classAttribute){
                        assert.isFalse(classContains(classAttribute, 'dijitMenuItemSelected'), "first choice not marked as selected");
                    })
                .end();
        },
        'close global context menu (mouse)': function (){
            return command
                .moveMouseTo(2,2)
                .clickMouseButton(0)
                .findById('windowContextMenu')
                    .isDisplayed().then(function (displayed){
                        assert.isFalse(displayed, "menu should be hidden again");
                    })
                .end();

        },
        'open context menu over form widget (mouse)': function (){
            var widgetCoords, menuCoords;
            return command
                .findById('windowContextMenu')
                    .isDisplayed().then(function (displayed){
                        assert.isFalse(displayed, "menu should be initially hidden");
                    })
                .end()
                .findById('formwidget')
                    .moveMouseTo()
                    .clickMouseButton(2)
                .end()
                .findById('windowContextMenu')
                    .isDisplayed().then(function (displayed){
                        assert.isTrue(displayed, "menu is now shown");
                    })
                .end()
                .findById('formwidget')
                    .getPosition().then(function(pos){
                        widgetCoords = pos;
                    })
                    .getSize().then(function(size){
                        widgetCoords.h = size.height;
                        widgetCoords.w = size.width;
                    })
                .end()
                .findById('windowContextMenu')
                    .getPosition().then(function(pos){
                        menuCoords = pos;
                    })
                    .getSize().then(function(size){
                        menuCoords.h = size.height;
                        menuCoords.w = size.width;

                        assert.isTrue(((menuCoords.x > widgetCoords.x) && (menuCoords.x < (widgetCoords.x + widgetCoords.w))) ||
                            (((menuCoords.x + menuCoords.w) > widgetCoords.x) && ((menuCoords.x + menuCoords.w) < (widgetCoords.x + widgetCoords.w))),
                            "begins or ends within the form widget horizontal boundaries");
                        assert.isTrue(((menuCoords.y > widgetCoords.y) && (menuCoords.y < (widgetCoords.y + widgetCoords.h))) ||
                            (((menuCoords.y + menuCoords.h) > widgetCoords.y) && ((menuCoords.y + menuCoords.h) < (widgetCoords.y + widgetCoords.h))),
                            "begins or ends within the form widget vertical boundaries");

                    })
                .end()
                .execute("return document.getElementById('windowContextMenu').parentNode.getAttribute('role')")
                    .then(function(role) {
                        assert.strictEqual("region", role, "context menu's wrapper node needs role=region");
                	})
                .execute("return document.getElementById('windowContextMenu').parentNode.getAttribute('aria-label')")
                    .then(function(ariaLabel) {
                        assert.strictEqual("windowContextMenu", ariaLabel, "menu's wrapper node needs aria-label");
                	});
        },
        'close form widget context menu (mouse)': function (){
            return command
                .moveMouseTo(2,2)
                .clickMouseButton(0)
                .findById('windowContextMenu')
                    .isDisplayed().then(function (displayed){
                        assert.isFalse(displayed, "menu should be hidden again");
                    })
                .end();
        }
    });

    registerSuite({
        name: 'More MenuBar mouse tests',

        'setup': function() {
            command = this.remote.get(require.toUrl('./support/test_Menu.html'))
                            .then(pollUntil("return window.setupComplete;"));
        },
        'teardown': function () {
            command = null;
        },

        'MenuBar selection and cancellation': function (){

            var paste;

            return command
                .findById('file')
                    .moveMouseTo()
                    .click()   // click File
                .end()
                .findById('fileMenu')
                    .isDisplayed().then(function (displayed){
                        assert.isTrue(displayed, "File menu should be visible #1");
                    })
                .end()
                .clickMouseButton(0)  // close File menu
                .findById('edit')
                    .moveMouseTo()
                .end()
                .findById('fileMenu')
                    .isDisplayed().then(function (displayed){
                        assert.isFalse(displayed, "File menu is hidden #1");
                    })
                .end()
                .findById('editMenu')
                    .isDisplayed().then(function (displayed){
                        assert.isFalse(displayed, "Edit menu is hidden #1");
                    })
                .end()
                .findById('file')
                    .getAttribute('class').then(function (classAttribute){
                        assert.isFalse(classContains(classAttribute, 'dijitMenuItemSelected'),
                            "File MenuBarItem should not have selected class, actual class is: " + classAttribute);
                        assert.isFalse(classContains(classAttribute, 'dijitMenuItemHover'),
                            "File MenuBarItem shouldn't have hover effect anymore, actual class is: " + classAttribute);
                    })
                .end()
                .findById('edit')
                    .getAttribute('class').then(function (classAttribute){
                        assert.isTrue(classContains(classAttribute, 'dijitMenuItemHover'),
                            "Edit MenuBarItem should have hover effect, actual class is: " + classAttribute);
                    })
                .end()
                .clickMouseButton(0)
                .findById('paste')
                    .moveMouseTo()
                .end()
                .clickMouseButton(0)
                .findById('edit')
                    .moveMouseTo()
                    .getAttribute('class').then(function (classAttribute){
                        assert.isTrue(classContains(classAttribute, 'dijitMenuItemHover'),
                            "Edit MenuBarItem should still have hover effect, actual class is: " + classAttribute);
                    })
                .end()
                .findById('editMenu')
                    .isDisplayed().then(function (displayed){
                        assert.isFalse(displayed, "edit menu disappeared #1");
                    })
                .end()
                .findById('file')
                    .moveMouseTo()
                .end()
                .findById('fileMenu')
                    .isDisplayed().then(function (displayed){
                        assert.isFalse(displayed, "File menu should be hidden #2");
                    })
                .end()
                .execute(registerHandlerScript('fileMenu', 'open')).then(function(result){
                            assert(result, "fileMenu onOpen Handler Registered");
                })
                .execute(registerHandlerScript('fileMenu', 'close')).then(function(result){
                            assert(result, "fileMenu onClose Handler Registered");
                })
                .execute(registerHandlerScript('editMenu', 'open')).then(function(result){
                            assert(result, "editMenu onOpen Handler Registered");
                })
                .execute(registerHandlerScript('editMenu', 'close')).then(function(result){
                            assert(result, "editMenu onClose Handler Registered");
                })
                .clickMouseButton(0)
                .then(pollUntil("return window.handlerCallback === 'fileMenu-onopen'"))
                .then(function(result){
                    assert.isTrue(result, "file menu open callback called");
                })
                .findById('fileMenu')
                    .isDisplayed().then(function (displayed){
                        assert.isTrue(displayed, "File menu should be visible #2");
                    })
                .end()
                .findById('view')
                    .moveMouseTo() // #9846
                .end()
                .then(pollUntil("return window.handlerCallback === 'fileMenu-onclose'"))
                .then(function(result){
                    assert.isTrue(result, "file menu close callback called");
                })
                .findById('edit')
                    .moveMouseTo()
                .end()
                .findById('fileMenu')
                    .isDisplayed().then(function (displayed){
                        assert.isFalse(displayed, "File menu should be hidden #3");
                    })
                .end()
                .then(pollUntil("return window.handlerCallback === 'editMenu-onopen'"))
                .then(function(result){
                    assert.isTrue(result, "edit menu open callback called");
                })
                .findById('editMenu')
                    .isDisplayed().then(function (displayed){
                        assert.isTrue(displayed, "Edit menu should be visible");
                    })
                .end()
                .findById('editMenu')
                    .isDisplayed().then(function (displayed){
                        assert.isTrue(displayed, "Edit menu should be visible");
                    })
                .end()
                .findById('paste')
                    .getPosition().then(function(pos){
                        paste = pos;
                    })
                    .getSize().then(function(size){
                        paste.h = size.height;
                        paste.w = size.width;

                        return command
                            .moveMouseTo(paste.x + (paste.w >> 1), paste.y + paste.h + 20)
                            .clickMouseButton(0)
                            .then(pollUntil("return window.handlerCallback === 'editMenu-onclose'"))
                            .then(function(result){
                                 assert.isTrue(result, "edit menu close callback called");
                            })
                            .findById('editMenu')
                                .isDisplayed().then(function (displayed){
                                    assert.isFalse(displayed, "Edit menu disappeared #2");
                                })
                            .end();
                    })
                .end();
        },
        'MenuBar navigation with BOTH mouse and keyboard': function (){
            return command
                .findById('link')
                    .moveMouseTo()
                    .clickMouseButton(0)
                .end()
                .findById('view')
                    .moveMouseTo()
                    .getAttribute('class').then(function (classAttribute){
                        assert.isTrue(classContains(classAttribute, 'dijitMenuItemHover'),
                            "View MenuBarItem should have hover effect, actual class is: " + classAttribute);
                    })
                .end()
                .findById('viewMenu')
                    .isDisplayed().then(function (displayed){
                        assert.isFalse(displayed, "View menu is hidden");
                    })
                .end()
                .pressKeys(keys.TAB)
                .pressKeys(keys.NULL)
                .findById('fileMenu')
                    .isDisplayed().then(function (displayed){
                        assert.isFalse(displayed, "File menu is hidden");
                    })
                .end()
                .findById('file')
                    .getAttribute('class').then(function (classAttribute){
                        assert.isTrue(classContains(classAttribute, 'dijitMenuItemSelected'),
                            "File MenuBarItem should have selected class, actual class is: " + classAttribute);
                    })
                .end()
                .findById('view')
                    .getAttribute('class').then(function (classAttribute){
                        assert.isFalse(classContains(classAttribute, 'dijitMenuItemHover'),
                            "View MenuBarItem shouldn't have hover effect anymore, actual class is: " + classAttribute);
                    })
                .end()
                .findById('edit')
                    .moveMouseTo()
                    .getAttribute('class').then(function (classAttribute){
                        assert.isTrue(classContains(classAttribute, 'dijitMenuItemHover'),
                            "Edit MenuBarItem should have hover effect, actual class is: " + classAttribute);
                    })
                .end()
                .findById('editMenu')
                    .isDisplayed().then(function (displayed){
                        assert.isFalse(displayed, "Edit menu is hidden");
                    })
                .end()
                .pressKeys(keys.ARROW_RIGHT)
                .pressKeys(keys.NULL)
                .pressKeys(keys.ARROW_RIGHT)
                .pressKeys(keys.NULL)
                .findById('viewMenu')
                    .isDisplayed().then(function (displayed){
                        assert.isFalse(displayed, "View menu is hidden");
                    })
                .end()
                .findById('view')
                    .getAttribute('class').then(function (classAttribute){
                        assert.isTrue(classContains(classAttribute, 'dijitMenuItemSelected'),
                            "View MenuBarItem should have selected class, actual class is: " + classAttribute);
                    })
                .end()
                .findById('edit')
                    .getAttribute('class').then(function (classAttribute){
                        assert.isFalse(classContains(classAttribute, 'dijitMenuItemHover'),
                            "Edit MenuBarItem shouldn't have hover effect anymore, actual class is: " + classAttribute);
                    })
                .end();
        },
        'Menu diagonal movement tests': function (){
            var popup;
            return command
                .findById('navMenuPopupItem1')
                    .moveMouseTo()  // move to Enabled submenu
                .end()
                .findById('navMenuSub1')
                    .isDisplayed().then(function (displayed){
                        assert.isFalse(displayed, "Enabled submenu should be hidden");
                    })
                .end()
                .clickMouseButton(0)  // click Enabled Submenu
                .findById('navMenuSub1')
                    .isDisplayed().then(function (displayed){
                        assert.isTrue(displayed, "Enabled submenu should be visible");
                    })
                .end()
                .findById('navMenuDisabledItem')
                    .moveMouseTo()
                .end()
                .sleep(1000) // linger long enough for menu to close
                .findById('navMenuSub1')
                    .isDisplayed().then(function (displayed){
                        assert.isFalse(displayed, "Enabled submenu should be hidden");
                    })
                .end()
                .findById('navMenuPopupItem1')  // move back to Enabled submenu
                    .moveMouseTo()
                .end()
                .sleep(1000)  // linger long enough for menu to open
                .findById('navMenuSub1')
                    .isDisplayed().then(function (displayed){
                        assert.isTrue(displayed, "Enabled submenu should be visible");
                    })
                .end()
                .findById('navMenuDisabledItem')  // QUICKLY move to the next menu item
                    .moveMouseTo()
                .end()
                .findById('navMenuSub1_item2')  // QUICKLY move to the popup menu
                    .moveMouseTo()
                .end()
                .findById('navMenuSub1')
                    .isDisplayed().then(function (displayed){
                        assert.isTrue(displayed, "Enabled submenu 1 should be visible");
                    })
                .end()
                .findById('navMenuSub1_item2')
                    .getAttribute('class').then(function (classAttribute){
                        assert.isTrue(classContains(classAttribute, 'dijitMenuItemHover'),
                            "Submenu 1, item 2 navigation MenuItem should have hover effect, actual class is: "  + classAttribute);
                    })
                .end()
                .findById('navMenuPopupItem1')
                    .getAttribute('class').then(function (classAttribute){
                        assert.isTrue(classContains(classAttribute, 'dijitMenuItemSelected'),
                            "'Enabled Submenu' MenuItem should have selected effect, actual class is: "   + classAttribute);
                    })
                .end()
                .findById('navMenuSub1_popup')
                    .getPosition().then(function(pos){
                        popup = pos;
                    })
                    .getSize().then(function(size){
                        popup.h = size.height;
                        popup.w = size.width;

                        return command
                            .moveMouseTo(popup.x + (popup.w >> 1), popup.y + popup.h + 20);
                    })
                .end()
                .findById('navMenuSub1')
                    .isDisplayed().then(function (displayed){
                        assert.isTrue(displayed, "Enabled submenu 1 menu still there");
                    })
                .end()
                .clickMouseButton(0)
                .findById('navMenuSub1')
                    .isDisplayed().then(function (displayed){
                        assert.isFalse(displayed, "Enabled submenu 1 menu disappeared");
                    })
                .end();
        }

    });

    registerSuite({
        name: 'passivePopupDelay',

        'setup': function() {
            command = this.remote.get(require.toUrl('./support/test_Menu.html'))
                            .then(pollUntil("return window.setupComplete;"))
                            .execute('return window.dijit.registry.byId("menubar").set("passivePopupDelay", 300);');
        },

        'teardown': function (){
            command = null;
        },

        'mouse over file MenuBarItem': function (){
            return command
                .findById('file')
                    .getAttribute('class').then(function (classAttribute){
                        assert.isFalse(classContains(classAttribute, 'dijitMenuItemHover'),  "File MenuBarItem doesn't have hover effect");
                    })
                .end()
                .findById('fileMenu')
                    .isDisplayed().then(function (displayed){
                        assert.isFalse(displayed,  "File menu is hidden");
                    })
                .end()
                .findById('file')
                    .moveMouseTo()
                .end()
                .sleep(1000)
                .findById('fileMenu')
                    .isDisplayed().then(function (displayed){
                        assert.isTrue(displayed, "File menu is visible");
                    })
                .end()
                .findById('new')
                    .getAttribute('class').then(function (classAttribute){
                        assert.isFalse(classContains(classAttribute, 'dijitMenuItemSelected'),
                            "New MenuItem should not have selected class, actual class is: " + classAttribute);
                    })
                .end();
        },
        'hover edit menu item': function (){
            return command
                .findById('edit')
                    .moveMouseTo()
                .end()
                .findById('editMenu')
                    // Since we've already activated the MenuBar by clicking "File",
                    // hovering over "Edit" should automatically show the edit menu
                    .isDisplayed().then(function (displayed){
                        assert.isTrue(displayed, "Edit menu is visible");
                    })
                .end()
                .findById('fileMenu')
                    // And also, the file menu should have disappeared
                    .isDisplayed().then(function (displayed){
                        assert.isFalse(displayed,  "File menu is hidden");
                    })
                .end();
        },
        'close menu by click': function (){
            return command
                .findById('link')
                    .moveMouseTo()
                    .click()
                .end()
                .findById('editMenu')
                    .isDisplayed().then(function (displayed){
                        assert.isFalse(displayed, "Edit menu is hidden");
                    })
                .end();
        }
    });
});
