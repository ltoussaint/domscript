describe("DOM tests", function() {
    describe("From existing element by id", function() {

        beforeEach(function() {
            document.getElementById('testDiv').innerHTML = '<div id="myIdElement" class="test toto" style="display: none;"></div>';
        });

        it("Test class methods", function() {
            var el = document.getElementById('myIdElement');

            // First check "has" method works, will use it later to check results
            expect($.hasClass(el, 'test')).toBeTruthy();
            expect($.hasClass(el, 'toto')).toBeTruthy();
            expect($.hasClass(el, 'tata')).toBeFalsy();

            // Check add and remove methods
            $.addClass(el, 'tata');
            $.removeClass(el, 'toto');

            expect($.hasClass(el, 'test')).toBeTruthy();
            expect($.hasClass(el, 'toto')).toBeFalsy();
            expect($.hasClass(el, 'tata')).toBeTruthy();
        });

        it("Test attributes methods", function() {
            var el = document.getElementById('myIdElement');

            // First check "get" method works, will use it later to check results
            expect($.getAttribute(el, 'id')).toBe('myIdElement');
            expect($.getAttribute(el, 'class')).toBe('test toto');
            expect($.getAttribute(el, 'role')).toBeNull();


            // Check "set" method
            $.setAttribute(el, 'class', 'papa');
            expect($.getAttribute(el, 'class')).toBe('papa');

            $.setAttribute(el, 'id', 'newId');
            expect($.getAttribute(el, 'id')).toBe('newId');

            $.setAttribute(el, 'role', 'test');
            expect($.getAttribute(el, 'role')).toBe('test');

        });

    });
});