define(['format', 'expectation', 'obj-diff', 'is-equal'],
function (format, Expectation, diff, isEqual) {
    "use strict";
    function Xcon () {

        // skins a console.log message to display the primitive type as well
        // as the expected output of a vanilla .log() command
        // opts: {
        //     "color": "#f9f9f9", // specify a css color
        //     "background": "rgb(0, 0, 0)", // specify a css color
        //     "log": true // also calls native console.log, which is useful for large objects and arrays
        // }
        // sometimes this function is called from console.run() to output
        // function return values.  In that case,
        // opts: {
        //     "color": "darkgreen", // or red
        //     "fnName": "nameOfFunction",
        //     "fnArgs": "all passed arguments",
        //     "error": true // indicates a thrown error
        // }
        this.out = this.out || function (blob, opts) {
            opts = opts || {};
            var logPart = format(blob, opts);
            this.log(logPart[0], logPart[1]);
            if (opts.log) {
                this.log(blob);
            }
        };

        // given a function, calls that function, returns the output,
        // and calls .out() to skin the output in green (success)
        // or red (failure).  Arguments, function name, and any error
        // messages are logged.
        this.run = this.run || function (fn, args, context) {
            if (typeof fn !== 'function') {
                this.out(arguments[0], arguments[1]);
                return arguments[0];
            }
            context = context || this;
            args = args || [];
            var result,
                opts = {
                    "fnName": fn.name || 'anonymous function',
                    "fnArgs": args.toString()
                };
            try {
                result = fn.apply(context, args);
                opts.color = 'darkgreen';
                this.out(result, opts);
                return result;
            } catch (e) {
                opts.color = 'red';
                opts.error = true;
                this.out(e.message, opts);
            }
        };

        // borrows heavily from jasmine.js syntax
        // console.expect instantiates an expectation object
        // with methods to test equality, truthiness,
        // falsiness, and whether or not data is defined.
        // Adding .not works the same way as jasmine.
        this.expect = this.expect || function (thing) {
            var expect = new Expectation(this, thing);
            expect.not = new Expectation(this, thing, {"not": true});
            return expect;
        };

        // given two objects or two arrays, returns two objects/arrays
        // containing only the unique data for the corresponding argument.
        // ex: console.diff({"a": 1}, {"a": 1, "b": 2});
        // will return one empty object (no unique data in first arg)
        // and one object: {"b": 2} (the only unique data in second arg)
        this.diff = this.diff || function (obj, compare) {
            if (typeof obj !== "object" || typeof compare !== "object") {
                this.out("both arguments must be objects or arrays", {
                    "color": "red"
                });
                return false;
            }
            if (isEqual(obj, compare)) {
                this.out("both arguments are equal", {
                    "test": true,
                    "color": "darkgreen"
                });
                return false;
            }
            var diffs = diff(obj, compare);
            this.out("first argument has unique data: ", {
                "test": true,
                "color": "black",
                "background": "oldlace"
            });
            this.log(diffs.firstObjectDiff);
            this.out("second argument has unique data: ", {
                "test": true,
                "color": "black",
                "background": "papayawhip"
            });
            this.log(diffs.secondObjectDiff);
        };

        return this;

    }

    return Xcon.call(window.console);
});
