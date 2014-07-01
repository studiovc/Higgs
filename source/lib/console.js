/*****************************************************************************
*
*                      Higgs JavaScript Virtual Machine
*
*  This file is part of the Higgs project. The project is distributed at:
*  https://github.com/maximecb/Higgs
*
*  Copyright (c) 2011, Maxime Chevalier-Boisvert. All rights reserved.
*
*  This software is licensed under the following license (Modified BSD
*  License):
*
*  Redistribution and use in source and binary forms, with or without
*  modification, are permitted provided that the following conditions are
*  met:
*   1. Redistributions of source code must retain the above copyright
*      notice, this list of conditions and the following disclaimer.
*   2. Redistributions in binary form must reproduce the above copyright
*      notice, this list of conditions and the following disclaimer in the
*      documentation and/or other materials provided with the distribution.
*   3. The name of the author may not be used to endorse or promote
*      products derived from this software without specific prior written
*      permission.
*
*  THIS SOFTWARE IS PROVIDED ``AS IS'' AND ANY EXPRESS OR IMPLIED
*  WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
*  MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN
*  NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY DIRECT, INDIRECT,
*  INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT
*  NOT LIMITED TO PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
*  DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
*  THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
*  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
*  THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*
*****************************************************************************/

/**
Console functions
*/

(function()
{

    // Track visited objects
    var obs = [];

    // Mapping of special stringification functions
    var stringers = {};

    /**
    Stringify a string (inside an object)
    */
    stringers.string = function(str)
    {
        return "'" + str + "'";
    };

    /**
    Stringify an object
    */
    stringers.object = function(ob)
    {
        var keys = Object.keys(ob);
        var l = keys.length;
        var str = "{ ";
        var k;

        if (ob.__CONSOLE_VISITED__)
        {
            // TODO: better substitute string?
            return "{...}";
        }
        if (Object.getPrototypeOf(ob) == null && typeof ob.toString === "function")
        {
                return ob.toString();
        }
        else if (ob.hasOwnProperty && ob.hasOwnProperty("toString") && typeof ob.toString === "function")
        {
                return ob.toString();
        }
        else
        {
            ob.__CONSOLE_VISITED__ = true;
            obs.push(ob);
        }

        if (l > 0)
        {
            k = keys[0];
            str += k + " : " + stringify(ob[k]);
            for (var i = 1; i < l; i++)
            {
                k = keys[i];
                str += ", " + k + " : " + stringify(ob[k]);
            }
        }

        str += " }";
        return str;
    };

    /**
    Stringify an array
    */
    stringers.array = function(ar)
    {
        var l = ar.length;
        var max = 5;
        var str = "[ ";

        if (l > 0)
            str += stringify(ar[0]);

        for (var i = 1; (i < l) && (i < max); i++)
            str += ", " + stringify(ar[i]);

        if (i === max && l > max)
            str += ",...";

        str += " ]";
        return str;
    };

    /**
    Convert argument to string.
    */
    function stringify(thing)
    {
        var type;
        var string_fun;

        // special case raw pointers
        if ($ir_is_rawptr(thing))
            return "<RAWPTR>";

        // special case null
        if (thing === null)
            return "null";

        // special case undefined
        if (thing === undefined)
            return "undefined";

        // special case arrays
        // TODO: fix this
        type = (thing && typeof thing.push === "function" && "length" in thing) ?
                    "array" : typeof thing;

        // get appropriate stringify function
        string_fun = stringers[type];

        if (string_fun)
            return string_fun(thing);
        else
            return "" + thing;
    }

    /**
    Print arguments separated by tabs.
    */
    function log()
    {
        var l = arguments.length;
        var s = l - 1;
        var thing;
        var obs_l;
        var ob;
        var output = "";

        for (var i = 0; i < l; i++)
        {
            obs = [];

            thing = arguments[i];
            if (typeof thing === "string")
                if (i === s)
                    output += thing;
                else
                    output += thing + "\t";
            else if (i === s)
                output += stringify(thing);
            else
                output += stringify(thing) + " ";

            obs_l = obs.length;
            while (obs_l--)
            {
                ob = obs[obs_l];
                delete ob.__CONSOLE_VISITED__;
            }
        }

        print(output);
    }

    // Timers for .time() and .timeEnd()
    var timers = Object.create(null);

    /**
    time -
        start a timer.
    */
    function time(timer)
    {
        var timer_name = timer || "*unnamed timer*";
        if (timers[timer_name] !== undefined)
            throw "Invalid timer name for time: "  + timer_name;
        else
            timers[timer_name] = $ir_get_time_ms();
    }

    /**
    timeEnd -
        stop a timer and print the elapsed time to the console.
    */
    function timeEnd(timer)
    {
        var timer_name = timer || "*unnamed timer*";
        var start_time = timers[timer_name];
        if (start_time === undefined)
            throw "Invalid timer name for timeEnd: " + timer_name;

        print(timer_name + ":\t" + ($ir_get_time_ms() - start_time));
        timers[timer_name] = undefined;
    }


    exports = {
        log : log,
        time : time,
        timeEnd : timeEnd,
        stringify : stringify,
        stringers : stringers
    };

})();

