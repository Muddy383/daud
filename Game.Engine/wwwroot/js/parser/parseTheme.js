const antlr4 = require("antlr4");
const CSSselect = require("css-select");
var ScssLexer = require("./ScssLexer").ScssLexer;
var ScssParser = require("./ScssParser").ScssParser;
var sass = require('sass');

var input = sass.renderSync({file: "../models/spriteModeMap.scss"}).css.toString('utf8'); 
function parseCssIntoRules(css) {
   var chars = new antlr4.InputStream(css);
   var lexer = new ScssLexer(chars);
   var tokens = new antlr4.CommonTokenStream(lexer);
   var parser = new ScssParser(tokens);
   var tree = parser.stylesheet();

   var ruleList = [];
   function addRulesFromStatement(statement, rules) {
      var selectors = statement.ruleset().selectors();
      var block = statement.ruleset().block();

      var blockProps = block.property().map((x, i) => [block.property(i).identifier().getText(), block.property(i).values().children.map(x => x.children ? x.children.map(y => y.getText()).join(" ") : x.getText()).join(" ")]);
      var blockOBJ = {};

      for (var i = 0; i < blockProps.length; i++) {
         blockOBJ[blockProps[i][0]] = blockProps[i][1];
      }
      for (var i = 0; i < selectors.children.length; i++) {
         rules.push({ selector: selectors.selector(i).getText(), obj: blockOBJ });
      }
   }

   //nested select is still broken but should be an easy fix ( or could just compile to css)
   for (var i = 0; i < tree.children.length; i++) {
      addRulesFromStatement(tree.children[i], ruleList);
   }
   return ruleList;
}
var ruleList = parseCssIntoRules(input);

function selectorMatches(selector, selectProps) {
   var thing = {
      type: 'tag',
      name: selectProps.element,
      attribs: {
         id: selectProps.id,
         class: selectProps.class
      }
   };
   return CSSselect.is(thing, selector);

}


function queryProperties(element,ruleList) {
   var res = {};
   for (var i = 0; i < ruleList.length; i++) {
      if (selectorMatches(ruleList[i].selector, element)) {
         for (var p in ruleList[i].obj) {
            if (res[p] == undefined) {
               res[p] = "''";
            }
            res[p] = ruleList[i].obj[p].replace("inherit", res[p]);
         }
      }
   }
   return res;
}

function getShipProperties(ship, more,ruleList) {
   return queryProperties({ element:"ship", class: ship + " " + more.join(" "), },ruleList)
}
console.log(getShipProperties("cyan", ["boost", "defenseupgrade"]),ruleList)
console.log(queryProperties({ element: "bg"}),ruleList)
