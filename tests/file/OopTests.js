describe("OOP tests", function() {
    describe("Single class", function () {
        $.Class("A", function (that) {
            var _this = this;

            this.publicProperty = "publicProperty";
            that.protectedProperty = "protectedProperty";
            var privateProperty = "privateProperty";

            this.publicInitInPrivate = null;
            var privateInitInPrivate = null;

            this.__construct = function (constructParam) {
                _initInPrivate();
            };

            function _initInPrivate() {
                _this.publicInitInPrivate = "public in private";
                privateInitInPrivate = "private init in private";
            }

            this.getPublicProperty = function () {
                return this.publicProperty;
            };
            this.getProtectedProperty = function () {
                return that.protectedProperty;
            };
            this.getPrivateProperty = function () {
                return privateProperty;
            };

            this.setPublicProperty = function (newValue) {
                this.publicProperty = newValue;
                return this;
            };
            this.setProtectedProperty = function (newValue) {
                that.protectedProperty = newValue;
                return this;
            };
            this.setPrivateProperty = function (newValue) {
                privateProperty = newValue;
                return this;
            };
        });

        $.Class("toto", function (that) {
        });

        var oA = $.Load("A", "paramInConstruct");

        it("Read properties", (function () {
            expect(oA.publicProperty).toBe("publicProperty");
            expect(oA.protectedProperty).toBeUndefined();
            expect(oA.privateProperty).toBeUndefined();
            expect(function () {
                return privateProperty;
            }).toThrow();
        }));

        it("Get properties with getters", function () {
            expect(oA.getPublicProperty()).toBe("publicProperty");
            expect(oA.getProtectedProperty()).toBe("protectedProperty");
            expect(oA.getPrivateProperty()).toBe("privateProperty");
        });

        it("Set properties", function () {
            privateProperty = "privatePropertyWithoutSetter";
            oA.privateProperty = "privatePropertyWithoutSetter";
            oA.protectedProperty = "protectedPropertyWithoutSetter";
            oA.publicProperty = "publicPropertyWithoutSetter";
            expect(oA.getPublicProperty()).toBe("publicPropertyWithoutSetter");
            expect(oA.getProtectedProperty()).toBe("protectedProperty");
            expect(oA.getPrivateProperty()).toBe("privateProperty");
        });

        it("Set properties with setters", function () {
            oA.setPublicProperty("publicPropertyBySetter");
            oA.setProtectedProperty("protectedPropertyBySetter");
            oA.setPrivateProperty("privatePropertyBySetter");
            expect(oA.getPublicProperty()).toBe("publicPropertyBySetter");
            expect(oA.getProtectedProperty()).toBe("protectedPropertyBySetter");
            expect(oA.getPrivateProperty()).toBe("privatePropertyBySetter");
        });

        it("Object type", function () {
            expect($.isInstanceOf(oA, "A")).toBeTruthy();
            expect($.isInstanceOf(oA, "toto")).toBeFalsy();
        });

    });

    describe("Single class advanced", function () {

        var classicA, classicB, singletonA, singletonB;

        beforeEach(function() {
            $.Class('myClassicClass', function(that) {
                var privateProperty = 'privateProperty';
                that.protectedProperty = 'protectedProperty';
                this.publicProperty = 'publicProperty';

                this.getProtectedProperty = function() {
                    return that.protectedProperty;
                };
                this.setProtectedProperty = function(value) {
                    that.protectedProperty = value;
                    return this;
                };

                this.getPrivateProperty = function() {
                    return privateProperty;
                };
                this.setPrivateProperty = function(value) {
                    privateProperty = value;
                    return this;
                };
            });

            $.Class('mySingleton', function(that) {
                var privateProperty = 'privateProperty';
                that.protectedProperty = 'protectedProperty';
                this.publicProperty = 'publicProperty';

                this.getProtectedProperty = function() {
                    return that.protectedProperty;
                };
                this.setProtectedProperty = function(value) {
                    that.protectedProperty = value;
                    return this;
                };

                this.getPrivateProperty = function() {
                    return privateProperty;
                };
                this.setPrivateProperty = function(value) {
                    privateProperty = value;
                    return this;
                };
            }, true);

            classicA = $.Load('myClassicClass');
            classicB = $.Load('myClassicClass');

            classicB.publicProperty = 'publicPropertyModified';
            classicB.setProtectedProperty('protectedPropertyModified');
            classicB.setPrivateProperty('privatePropertyModified');

            singletonA = $.Load('mySingleton');
            singletonB = $.Load('mySingleton');

            singletonB.publicProperty = 'publicPropertyModified';
            singletonB.setProtectedProperty('protectedPropertyModified');
            singletonB.setPrivateProperty('privatePropertyModified');
        });

        it('Test several instance of class', function() {
            expect(classicA.__instanceId == classicB.__instanceId).toBeFalsy();

            expect(classicA.publicProperty).toBe('publicProperty');
            expect(classicA.getProtectedProperty()).toBe('protectedProperty');
            expect(classicA.getPrivateProperty()).toBe('privateProperty');

            expect(classicB.publicProperty).toBe('publicPropertyModified');
            expect(classicB.getProtectedProperty()).toBe('protectedPropertyModified');
            expect(classicB.getPrivateProperty()).toBe('privatePropertyModified');
        });

        it('Test several instance of singleton', function() {
            expect(singletonA.__instanceId == singletonB.__instanceId).toBeTruthy();

            expect(singletonA.publicProperty).toBe('publicPropertyModified');
            expect(singletonA.getProtectedProperty()).toBe('protectedPropertyModified');
            expect(singletonA.getPrivateProperty()).toBe('privatePropertyModified');

            expect(singletonB.publicProperty).toBe('publicPropertyModified');
            expect(singletonB.getProtectedProperty()).toBe('protectedPropertyModified');
            expect(singletonB.getPrivateProperty()).toBe('privatePropertyModified');
        });

    });

    describe("Single inheritance", function () {

        $.Class("toto", function (that) {
        });

        $.Class("B", function (that) {
            var _this = this;

            this.parentPublicProperty = "parentPublicProperty";
            that.parentProtectedProperty = "parentProtectedProperty";
            var parentPrivateProperty = "parentPrivateProperty";

            this.parentPublicPropertySetByChild = "parentPublicPropertySetByChildFromParent";
            that.parentProtectedPropertySetByChild = "parentProtectedPropertySetByChildFromParent";
            var parentPrivatePropertySetByChild = "parentPrivatePropertySetByChildFromParent";

            this.parentPublicPropertySetByConstruct = "";
            that.parentProtectedPropertySetByConstruct = "";
            var parentPrivatePropertySetByConstruct = "";

            var extendedPrivateProperty = "extendedPrivatePropertyFromParent";
            that.extendedProtectedProperty = "extendedProtectedPropertyFromParent";
            this.extendedPublicProperty = "extendedPublicPropertyFromParent";

            this.parentConstructIsCalled = false;
            this.parentConstructParam = "parentDefaultConstructParam";

            this.__construct = function (constructParam) {
                this.parentConstructIsCalled = true;
                this.parentConstructParam = constructParam;

                this.parentPublicPropertySetByConstruct = "parentPublicPropertySetByConstructFromParent";
                that.parentProtectedPropertySetByConstruct = "parentProtectedPropertySetByConstructFromParent";
                parentPrivatePropertySetByConstruct = "parentPrivatePropertySetByConstructFromParent";
            };

            this.getParentPublicProperty = function () {
                return this.parentPublicProperty;
            };
            this.getParentProtectedProperty = function () {
                return that.parentProtectedProperty;
            };
            this.getParentPrivateProperty = function () {
                return parentPrivateProperty;
            };

            this.getParentPublicPropertySetByChild = function () {
                return this.parentPublicPropertySetByChild;
            };
            this.getParentProtectedPropertySetByChild = function () {
                return that.parentProtectedPropertySetByChild;
            };
            this.getParentPrivatePropertySetByChild = function () {
                return parentPrivatePropertySetByChild;
            };

            this.getParentPublicPropertySetByConstruct = function () {
                return this.parentPublicPropertySetByConstruct;
            };
            this.getParentProtectedPropertySetByConstruct = function () {
                return that.parentProtectedPropertySetByConstruct;
            };
            this.getParentPrivatePropertySetByConstruct = function () {
                return parentPrivatePropertySetByConstruct;
            };

            this.getExtendedPrivatePropertyFromParent = function () {
                return extendedPrivateProperty;
            };
            this.getExtendedProtectedPropertyFromParent = function () {
                return that.extendedProtectedProperty;
            };
            this.getExtendedPublicPropertyFromParent = function () {
                return this.extendedPublicProperty;
            };

            this.setParentPublicPropertySetByChild = function (value) {
                this.parentPublicPropertySetByChild = value;
                return this;
            };
            this.setParentProtectedPropertySetByChild = function (value) {
                that.parentProtectedPropertySetByChild = value;
                return this;
            };
            this.setParentPrivatePropertySetByChild = function (value) {
                parentPrivatePropertySetByChild = value;
                return this;
            };
        });

        $.Class("A", function (that) {
            var childPrivateProperty = "childPrivateProperty";
            that.childProtectedProperty = "childProtectedProperty";
            this.childPublicProperty = "childPublicProperty";

            this.childConstructIsCalled = false;
            this.childContructParam = "childDefaultConstructParam";

            var extendedPrivateProperty = "extendedPrivatePropertyFromParent";
            that.extendedProtectedProperty = "extendedProtectedPropertyFromParent";
            this.extendedPublicProperty = "extendedPublicPropertyFromParent";

            this.__construct = function (constructParam) {
                this.childConstructIsCalled = true;
                this.childConstructParam = constructParam;

                this.parentCall("__construct", "parentConstructParamFromChild");

                this.parentPublicPropertySetByConstruct = "parentPublicPropertySetByConstructFromChild";
                that.parentProtectedPropertySetByConstruct = "parentProtectedPropertySetByConstructFromChild";
                parentPrivatePropertySetByConstruct = "parentPrivatePropertySetByConstructFromChild";
            };

            this.getChildPrivateProperty = function () {
                return childPrivateProperty;
            };
            this.getChildProtectedProperty = function () {
                return that.childProtectedProperty;
            };
            this.getChildPublicProperty = function () {
                return this.childPublicProperty;
            };

            this.getExtendedPrivatePropertyFromChild = function () {
                return extendedPrivateProperty;
            };
            this.getExtendedProtectedPropertyFromChild = function () {
                return that.extendedProtectedProperty;
            };
            this.getExtendedPublicPropertyFromChild = function () {
                return this.extendedPublicProperty;
            };

        }).Extend("B");

        var oA = $.Load("A", "childConstructParamFromLoad");
        oA.setParentPrivatePropertySetByChild('parentPrivatePropertySetByChildFromChild');
        oA.setParentProtectedPropertySetByChild('parentProtectedPropertySetByChildFromChild');
        oA.setParentPublicPropertySetByChild('parentPublicPropertySetByChildFromChild');

        var oB = $.Load("B", "parentConstructParamFromLoad");

        describe("Parent instance", function () {
            it("Don't find child properties and methods", function () {
                expect(oB.publicPublicProperty).toBeUndefined();
                expect(oB.getPublicPublicProperty).toBeUndefined();
            });

            it("Constructor call", function () {
                expect(oB.childConstructIsCalled).toBeUndefined();
                expect(oB.parentConstructIsCalled).toBeTruthy();
                expect(oB.parentConstructParam).toBe('parentConstructParamFromLoad');
            });

            it("Read properties set in parent class", function () {
                expect(oB.parentPublicProperty).toBe("parentPublicProperty");
                expect(oB.getParentPublicProperty()).toBe("parentPublicProperty");
                expect(oB.getParentProtectedProperty()).toBe("parentProtectedProperty");
                expect(oB.getParentPrivateProperty()).toBe("parentPrivateProperty");
            });

            it("Read properties set in child class", function () {
                // Set in child class should not be done
                expect(oB.parentPublicPropertySetByChild).toBe("parentPublicPropertySetByChildFromParent");
                expect(oB.getParentPublicPropertySetByChild()).toBe("parentPublicPropertySetByChildFromParent");
                expect(oB.getParentProtectedPropertySetByChild()).toBe("parentProtectedPropertySetByChildFromParent");
                expect(oB.getParentPrivatePropertySetByChild()).toBe("parentPrivatePropertySetByChildFromParent");
            });

            it("Read properties set in construct method", function () {
                // Set in child class should not be done
                expect(oB.parentPublicPropertySetByConstruct).toBe("parentPublicPropertySetByConstructFromParent");
                expect(oB.getParentPublicPropertySetByConstruct()).toBe("parentPublicPropertySetByConstructFromParent");
                expect(oB.getParentProtectedPropertySetByConstruct()).toBe("parentProtectedPropertySetByConstructFromParent");
                expect(oB.getParentPrivatePropertySetByConstruct()).toBe("parentPrivatePropertySetByConstructFromParent");
            });

            it("Read properties extended by child class", function () {
                expect(oB.extendedPublicProperty).toBe("extendedPublicPropertyFromParent");
                expect(oB.getExtendedPublicPropertyFromParent()).toBe("extendedPublicPropertyFromParent");
                expect(oB.getExtendedProtectedPropertyFromParent()).toBe("extendedProtectedPropertyFromParent");
                expect(oB.getExtendedPrivatePropertyFromParent()).toBe("extendedPrivatePropertyFromParent");
            });
        });

        describe("Child instance", function () {
            it("Constructor call", function () {
                expect(oA.childConstructIsCalled).toBeTruthy();
                expect(oA.parentConstructIsCalled).toBeTruthy();
                expect(oA.childConstructParam).toBe('childConstructParamFromLoad');
                expect(oA.parentConstructParam).toBe('parentConstructParamFromChild');
            });

            it("Read properties set in child class", function () {
                expect(oA.childPublicProperty).toBe("childPublicProperty");
                expect(oA.getChildPublicProperty()).toBe("childPublicProperty");
                expect(oA.getChildProtectedProperty()).toBe("childProtectedProperty");
                expect(oA.getChildPrivateProperty()).toBe("childPrivateProperty");
            });

            it("Read properties set in parent class", function () {
                expect(oA.parentPublicProperty).toBe("parentPublicProperty");
                expect(oA.getParentPublicProperty()).toBe("parentPublicProperty");
                expect(oA.getParentProtectedProperty()).toBe("parentProtectedProperty");
                expect(oA.getParentPrivateProperty()).toBe("parentPrivateProperty");
            });

            it("Read properties set in child class", function () {
                // Set in child class should not be done
                expect(oA.parentPublicPropertySetByChild).toBe("parentPublicPropertySetByChildFromChild");
                expect(oA.getParentPublicPropertySetByChild()).toBe("parentPublicPropertySetByChildFromChild");
                expect(oA.getParentProtectedPropertySetByChild()).toBe("parentProtectedPropertySetByChildFromChild");
                expect(oA.getParentPrivatePropertySetByChild()).toBe("parentPrivatePropertySetByChildFromChild");
            });

            it("Read properties set in construct method", function () {
                // Set in child class should not be done
                expect(oA.parentPublicPropertySetByConstruct).toBe("parentPublicPropertySetByConstructFromChild");
                expect(oA.getParentPublicPropertySetByConstruct()).toBe("parentPublicPropertySetByConstructFromChild");
                expect(oA.getParentProtectedPropertySetByConstruct()).toBe("parentProtectedPropertySetByConstructFromChild");
                expect(oA.getParentPrivatePropertySetByConstruct()).toBe("parentPrivatePropertySetByConstructFromParent");
            });

            it("Read properties extended by child class", function () {
                expect(oA.extendedPublicProperty).toBe("extendedPublicPropertyFromParent");
                expect(oA.getExtendedPublicPropertyFromParent()).toBe("extendedPublicPropertyFromParent");
                expect(oA.getExtendedProtectedPropertyFromParent()).toBe("extendedProtectedPropertyFromParent");
                expect(oA.getExtendedPrivatePropertyFromParent()).toBe("extendedPrivatePropertyFromParent");
            });

            it("Object type", (function () {
                expect($.isInstanceOf(oA, "A")).toBeTruthy();
                expect($.isInstanceOf(oA, "B")).toBeTruthy();
                expect($.isInstanceOf(oA, "toto")).toBeFalsy();
            }));
        });

        describe("Extend singleton", function() {

            var object1, object2;

            $.Class('mySingleton', function(that) {
                this.publicProperty = 'publicProperty';
            }, true);

            $.Class('myChildClass', function() {

            }).Extend('mySingleton');

            beforeEach(function() {
                object1 = $.Load('myChildClass');
                object2 = $.Load('myChildClass');

                object1.publicProperty = 'publicPropertyObject1';
                object2.publicProperty = 'publicPropertyObject2';
            });

            it('Singleton children are singletons', function() {
                expect(object1.__instanceId == object2.__instanceId).toBeTruthy();

                expect(object1.publicProperty).toBe('publicPropertyObject2');
                expect(object2.publicProperty).toBe('publicPropertyObject2');
            });

        });

    });
});