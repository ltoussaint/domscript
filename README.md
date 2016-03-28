# DomScript

## What is DomScript

DomScript is a JavaScript framework which allow to manipulate easily DOM elements.  
It uses [underscore.js](http://underscorejs.org/) library.

DomScript uses objects and inheritance with simulation of private (using current context) and protected properties and methods.

DomScript is split in 2 packages
* core : basic library with including underscore plus event management, DOM manipulation, inheritance system, ...
* domscript : different classes to help you manage DOM elements.

## core

### Events

#### Classic events

Event listening is easy.
Use the method `$.addEvent` with real DOM node, event to listen and function callback.

```javascript
var el = document.getElementById('myButton');

$.addEvent(el, 'click', function() {
    alert('Click works');
});
```

#### Custom events

You also can create custom event.
Attach these event to `document`.

```javascript
$.addEvent(document, 'myCustomEvent', function(event, data) {
    console.log('Catch my custom event :', data)
});

$.triggerEvent(document, 'myCustomEvent', {'custom':'data'});
```

### Dom manipulations

#### Manage classes

Add a class

```javascript
$.addClass(myElement, 'toto');
```

Remove a class

```javascript
$.removeClass(myElement, 'toto');
```

Check a class 

```javascript
$.hasClass(myElement, 'toto');
```

### Manage attributes

Get attribute value

```javascript
$.getAttribute(myElement, 'id');
```

Set attribute

```javascript
$.setAttribute(myElement, 'myNewId');
```

### Manage style

Add a single style rule

```javascript
$.addStyle(myElement, 'color', '#F00');
``` 

Add several style rules

```javascript
$.addCss(myElement, {
    'color': '#00F',
    'text-align': 'center'
});
```

### Class and inheritance

#### Create class

##### Classic creation

To create a class, use the `$.Class` method.

You can have 3 kinds of properties/methods:

- public : using `this`
- protected : using `that` parameter given to the function defining your class
- private : simply using variables in your function context

```javascript
$.Class('myClass', function(that) {
    var myPrivateProperty = 'privateProperty';
    that.myProtectedProperty = 'protectedProperty';
    this.myPublicProperty = 'publicProperty';

    function myPrivateMethod () {
        return 'myPrivateMethod'
    }

    that.myProtectedMethod = function() {
        return 'myProtectedMethod';
    };

    this.myPublicMethod = function() {
        return 'myPublicMethod';
    };
});

```

##### Initialize your class

Classes come with `__construct` public method.  
Each time a class is loaded, the system looks for `__construct` public method and call it.  
It allow you to initialize your object.

```javascript
$.Class('myClass', function() {
    
    this.__construct = function() {
        alert('Initialize my object');
    };
 
});
```

#####  Wait DOM ready

You also can add an handler to the DOMReady event.  
To do so, just add the public method `__ready`

```javascript
$.Class('myClass', function() {
    
    this.__construct = function() {
        alert('Initialize my object');
    };
    
    this.__ready = function() {
        alert('DOM is ready');
    };
});
```

#### Load a class

To load a class, use `$.Load` method.  
The first parameter is the name of the class to load.  
The other parameters are just passed to the constructor.  

```javascript
$.Class('myClass', function() {
    
    this.__construct = function(first, second) {
        alert('Initialize my object : ' + first + ' : ' + second);
    };
    
    this.__ready = function() {
        alert('DOM is ready');
    };
 
});

var myInstance = $.Load('myClass', 'one', 'two');
```

It will result with an alert displaying `Initialize my object : one : two`

#### Singleton

You can create classes defined as singleton.  
So each instance really refer to the same object.  

To define a class as a singleton, just set to `true` the third parameter of `$.Class`.

```javascript 
$.Class('mySingleton', function() {
   ...
}, true);
```

#### Inheritance

Just use `Extend` method after `Class`.

```javascript
$.Class('myChild', function(that) {
    ...
}).Extend('myParent');
```

##### Call parent method

In a method, you can call the extended parent method by using `this.parentCall('methodName', parameters...);`  
Most of the time, you will use it with `__construct` method.

```javascript
$.Class('myChild', function(that) {
    
    this.__construct = function() {
    	this.parentCall('__construct', parameters...);
    };
    
}).Extend('myParent');
```

##### Example

```javascript
$.Class('myParent', function(that) {
    this.parentProperty = null;
    this.parentProperty2 = null;
    
    this.__construct = function() {
        this.parentProperty = 'parentProperty';
    };
    
    this.alertProperties = function() {
        alert(this.parentProperty + ' : ' + this.parentProperty2);
    };
});

$.Class('myChild', function(that) {

    this.__construct = function() {
    this.parentCall('__construct');
        this.parentProperty2 = 'parentPropertyByChild';
    };
    
    
}).Extend('myParent');

var childInstance = $.Load('myChild');
childInstance.alertProperties();
```

## DomScript

### $.Dom.Element

#### Create $.Dom.Element

Following dexamples are based on events documentation.  
Here is another way using `$.Dom.Element`

##### Using existing DOM node

You can attache a DOM node to a `$.Dom.Element` instance using the real node.

_html_
```html
<a id="myButton">My Button</a>
```


_javascript_
```javascript
var myButton = $.Load('$.Dom.Element', document.getElementById('myButton'));

myButton.addEvent('click', function() {
    alert('Click works');
});
```

##### Using existing DOM node by its id

You can attache a DOM node to a `$.Dom.Element` instance using its id.

```html
<a id="myButton">My Button</a>
```

```javascript
var myButton = $.Load('$.Dom.Element', '#myButton');

myButton.addEvent('click', function() {
    alert('Click works');
});
```

##### Create DomElement

You can create a `$.Dom.Element` object from scratch.

```javascript
var myButton = $.Load('$.Dom.Element', 'a');
myButton.text('my Button');
$.Load('$.Dom.Body').appendChild(myButton);

myButton.addEvent('click', function() {
    alert('Click works');
});
```

#### Inherit DomElement

You can extend `$.Dom.Element` and define it in your child class.

##### Classic inheritance

The following example create a button containing `button text` text.  
By clicking on this button, an alert appear with the text `Click works`.

```javascript
$.Class('myButton', function(that) {
    
    this.__construct = function(buttonText) {
        this.parentCall('__construct', 'button'); // Tell $.Dom.element to create a <button>
        this.text(buttonText); // Set element text
        
        this.addEvent('click', function() { // Add event handler
            alert('Click works');
        });
    };
    
}).Extend('$.Dom.Element');

$.Load('$.Dom.Body').appendChild($.Load('myButton', 'button text')); // Append button to body

```