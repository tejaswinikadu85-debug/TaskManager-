🔍 Parsing
Reading HTML code and converting it into a structure the browser can understand.
--Browser reads tags and understands hierarchy
--Example: Browser reads <div><p>Hello</p></div> and knows p is inside div
--Without parsing, HTML would just be plain text


🔤 Tokenization
Breaking HTML into small meaningful pieces called tokens.
--Tokens include: opening tags, closing tags, attributes, text content
--Example: <button id="btn">Click</button> becomes:
  Opening tag token: <button>
  Attribute token: id="btn"
  Text token: Click
  Closing tag token: </button>
  

🌳 DOM Tree
Hierarchical representation of HTML document (family tree of elements).
--Every element becomes a node
--Parent-child relationships are maintained
--JavaScript can access and manipulate this tree
--Example: body → div → p → text


🎨 CSSOM Tree
Object representation of CSS styles (similar to DOM but for CSS).
--Represents all CSS rules and their specificity
--Determines which styles apply to which elements
--Example: .btn { color: red } becomes a rule in CSSOM


🖼️ Render Tree
Combination of DOM + CSSOM - what actually gets painted on screen.
--Only visible elements are included
   display: none elements are excluded
--Calculates positions and styles before painting


🔄 Event Bubbling
Event travels UP from target to ancestors (bottom → top).
--Default behavior in browsers
--Event fires on target first, then parents
--Example: Click button → button fires → parent fires → grandparent fires

⬇️ Event Capturing
Event travels DOWN from window to target (top → bottom).
--Opposite of bubbling
--Must opt-in with { capture: true }
--Fires before target receives the event


🎯 Event Delegation
Adding ONE listener to parent to handle ALL children events.
--Uses bubbling to catch events from children
--Uses e.target to know which child was clicked
--Saves memory (1 listener vs 100)
--Works for dynamically added elements

