
function handle_parse(){
	var expr = $("#expression")[0].value;
	$("#result")[0].innerHTML=""
	try {
		result_tree = expression_tree(expr);
		print_svg_tree(result_tree);
		svg_code = (new XMLSerializer).serializeToString($("svg")[0])
		send_history("Parse", expr, "success", svg_code);

	} catch (e) {
		if (e.reason !== undefined){
			$("#result")[0].innerHTML="<p>Error: "+e.reason+"</p>"
			send_history("Parse", expr, "error", e.reason);
		} else {
			throw e;
		}
	}
}

function handle_square_expand(){
	var expr = $("#expression")[0].value;
	$("#result")[0].innerHTML=""
	try {
		var expr_tree = expression_tree(expr);
		var expanded_tree = square_expand(expr_tree);
		if (node_is_equal(expr_tree, expanded_tree)){
			throw {status: "error", reason: "Nothing to Expand Here"};
		}
		print_svg_tree(expanded_tree);
		var svg_code = (new XMLSerializer).serializeToString($("svg")[0]);
		send_history("Expand", expr, "success", svg_code);
	} catch (e) {
		if (e.reason !== undefined){
			$("#result")[0].innerHTML="<p>Error: "+e.reason+"</p>"
			send_history("Expand", expr, "error", e.reason);
		} else {
			throw e;
		}
	}
}

function handle_square_collaps(){
	var expr = $("#expression")[0].value;
	$("#result")[0].innerHTML=""
	try {
		var expr_tree = expression_tree(expr);
		var collapsed_tree = square_collaps(expr_tree);
		if (node_is_equal(expr_tree, collapsed_tree)){
			throw {status: "error", reason: "Nothing to Collaps Here"};
		}
		print_svg_tree(collapsed_tree);
		var svg_code = (new XMLSerializer).serializeToString($("svg")[0]);
		send_history("Collaps", expr, "success", svg_code);
	} catch (e) {
		if (e.reason !== undefined){
			$("#result")[0].innerHTML="<p>Error: "+e.reason+"</p>"
			send_history("Collaps", expr, "error", e.reason);
		} else {
			throw e;
		}
	}
}

//recursive square difference expanding
function square_expand(node){
	var first = node.children[0];
	var second = node.children[1];
	var name = node.name;
	if (first === undefined && second === undefined){
		return node;
	}
	if (first === undefined || second === undefined){
		throw {status: "error", reason: "Tree is not Binary"};
	}
	var first_first = first.children[0];
	var first_second = first.children[1];
	var second_first = second.children[0];
	var second_second = second.children[1];

	if (first_first === undefined || first_second === undefined || 
		second_first === undefined || second_second === undefined){

		var expanded_first = square_expand(first);
		var expanded_second = square_expand(second);
		return {name: name, children:[expanded_first, expanded_second]}
	}

	if (name == "-" && first.name == "^" && second.name == "^"){
		if (is_number(first_second.name) && is_number(second_second.name)){
			if (parseInt(first_second.name)%2==0 && parseInt(second_second.name)%2==0){
				name = "*";

				var new_first_first
				var new_second_first
				var new_first_second
				var new_second_second
				if (first_second.name == "0"){
					new_first_first = {name: "1", children: []};
					new_second_first = {name: "1", children: []};
				} else if (first_second.name == "2"){
					new_first_first = first_first;
					new_second_first = node_clone(new_first_first);
				} else {
					new_first_first = {
						name: "^", 
						children: [first_first, {name: (parseInt(first_second.name)/2).toString(), children:[]}]
					}
					new_second_first = node_clone(new_first_first)
				}
				if (second_second.name == "0"){
					new_first_second = {name: "1", children: []};
					new_second_second = {name: "1", children: []};
				} else if (second_second.name == "2"){
					new_first_second = second_first;
					new_second_second = node_clone(new_first_second);
				} else {
					new_first_second = {
						name: "^", 
						children: [second_first, {name: (parseInt(second_second.name)/2).toString(), children:[]}]
					}
					new_second_second = node_clone(new_first_second)
				}
				first = {name: "-", children: [new_first_first, new_first_second]};
				second = {name: "+", children: [new_second_first, new_second_second]};
			}
		}
	}
	var expanded_first = square_expand(first);
	var expanded_second = square_expand(second);
	return {name: name, children:[expanded_first, expanded_second]}
}
//recursive square difference collapsing
function square_collaps(node){
	// recursion exit conditions
	// ensure this node has at least two levels of depth
	var first = node.children[0];
	var second = node.children[1];
	if (first === undefined && second === undefined){
		return node;
	}
	if (first === undefined || second === undefined){
		throw {status: "error", reason: "Tree is not Binary"};
	}
	var first_first = first.children[0];
	var first_second = first.children[1];
	var second_first = second.children[0];
	var second_second = second.children[1];

	if (first_first === undefined || first_second === undefined || 
		second_first === undefined || second_second === undefined){
		
		var first_collapsed = square_collaps(first);
		var second_collapsed = square_collaps(second);
		return {name: node.name, children:[first_collapsed, second_collapsed]};
	}

	// ensure child nodes are already collapsed
	var first_collapsed = square_collaps(first);
	var second_collapsed = square_collaps(second);

	//collaps current node
	//check formula operators 
	if (node.name != "*"){
		return {name:node.name, children:[first_collapsed,second_collapsed]};
	}
	if (first_collapsed.name=="-" && second_collapsed.name=="+"){
		var minus = first_collapsed;
		var plus = second_collapsed;
	} else if (first_collapsed.name=="+" && second_collapsed.name=="-"){
		var minus = second_collapsed;
		var plus = first_collapsed;
	} else {
		return {name:node.name, children:[first_collapsed,second_collapsed]};
	}
	var minus_first = minus.children[0];
	var minus_second = minus.children[1];
	var plus_first = plus.children[0];
	var plus_second = plus.children[1];

	// check formula operands
	if ((node_is_equal(minus_first, plus_first) && node_is_equal(minus_second, plus_second))
		||(node_is_equal(minus_first, plus_second) && node_is_equal(minus_second, plus_first))){
		//collapsing itself

		//double existing pow
		if (minus_first.name=="^"){
			if (is_number(minus_first.children[1].name)){
				var new_first = {
					name:"^", 
					children: [
						minus_first.children[0],
						{name: (parseInt(minus_first.children[1].name)*2).toString(), children: []}
						]
					};
			} else {
				var new_first = {
					name:"^", 
					children:[minus_first, {name:"2",children:[]} ]
				};
			}
		} else {
			var new_first = {
				name:"^", 
				children:[minus_first, {name:"2",children:[]} ]
			};
		}
		if (minus_second.name=="^"){
			if (is_number(minus_second.children[1].name)){
				var new_second = {
					name:"^", 
					children: [
						minus_second.children[0],
						{name: (parseInt(minus_second.children[1].name)*2).toString(), children: []}
						]
					};
			} else {
				var new_second = {
					name:"^", 
					children:[minus_second, {name:"2",children:[]} ]
				};
			}
		} else {
			var new_second = {
				name:"^", 
				children:[minus_second, {name:"2",children:[]} ]
			};
		}
		return {name:"-", children:[new_first, new_second]};

	} else {
		return {name:node.name, children:[first_collapsed,second_collapsed]};
	}

	
}

function expression_tree(expr) {
	lexem_arr = split_to_lexemes(expr);
	if (!lexem_arr.length) {
		throw {status: "error", reason: "Expression Is Empty"};
	}
	polish_arr = polish_notation(lexem_arr);
	tree = polish_to_tree(polish_arr);
	return tree
}

function polish_notation(lexemes) {
	var result = new Array();
	var stack = new Array();
	for (var i=0; i<lexemes.length; i++){
		var lex = lexemes[i];
		switch (lex.type) {
			case "operand":
				result.push(lex);
			break
			case "left_bracket":
				stack.push(lex);
			break
			case "right_bracket":
				while(true){
					var temp = stack.pop();
					if (temp === undefined){
						throw {status: "error", reason: "Brackets Do not Match"};
					} else if (temp.type == "left_bracket"){
						break
					} else {
						result.push(temp);
					}
				}
			break
			case "operator":
				while(true){
					var top = stack[stack.length-1];
					if (top === undefined) {
						stack.push(lex);
						break
					} else if (top.type == "left_bracket"){
						stack.push(lex);
						break
					} else if (top.prior >= lex.prior) {
						result.push(stack.pop());
					} else {
						stack.push(lex);
						break
					}
				}
			break
		}
	}
	while (true){
		var temp = stack.pop();
		if (temp === undefined) {
			break
		} else if (temp.type == "left_bracket") {
			throw {status: "error", reason: "Brackets Do not Match"};
		} else {
			result.push(temp);
		}
	}
	return result;
}

function is_variable(lexem){return RegExp("^[A-Za-z]$").test(lexem)}
function is_operator(lexem){return RegExp("^[-|\+|\*|\/|\(|\)|\^]$").test(lexem)}
function is_digit(lexem){return RegExp("^[0-9]$").test(lexem)}
function is_number(lexem){return RegExp("^[0-9]+$").test(lexem)}

function split_to_lexemes(expr){
	var result = new Array();
	var temp = "";
	for (var i = 0; i<expr.length; i++){
		if (is_variable(expr[i])) {
			if (is_number(temp)){
				result.push({type:"operand", value: temp});
				temp = "";
			}
			temp+=expr[i];
		} else if(is_operator(expr[i])) {
			if (temp.length){
				result.push({type:"operand", value: temp});
				temp = "";
			}
			switch (expr[i]){
				case "+":
					result.push({type: "operator", prior:1, value: expr[i]});
				break
				case "-":
					result.push({type: "operator", prior:1, value: expr[i]});
				break
				case "*":
					result.push({type: "operator", prior:2, value: expr[i]});
				break
				case "/":
					result.push({type: "operator", prior:2, value: expr[i]});
				break
				case "^":
					result.push({type: "operator", prior:3, value: expr[i]});
				break
				case "(":
					result.push({type: "left_bracket", value: expr[i]});
				break
				case ")":
					result.push({type: "right_bracket", value: expr[i]});
				break
			}
		} else if (is_digit(expr[i])) {
			if (temp.length == 0){
				if (expr[i]==0){
					// zero cant be a first symbol in a nimber
					result.push({type:"operand", value: expr[i]});
				} else {
					temp+=expr[i];
				}
			} else if (is_number(temp)) {
				temp+=expr[i];
			} else { //temp is a variable
				result.push({type:"operand", value: temp});
				temp = "";
				if (expr[i]==0){
					// zero cant be a first symbol in a nimber
					result.push({type:"operand", value: expr[i]});
				} else {
					temp+=expr[i];
				}
			}
			
		} else {
			throw {status: "error", reason: "Unallowed Symbol Found: "+expr[i]};
		}
	}
	if (temp.length) {
		result.push({type:"operand", value: temp});
	}
	return result;
}

function polish_to_tree(polish_arr) {
	var stack = [];
	for (var i = 0; i<polish_arr.length; i++){
		token = polish_arr[i];
		switch (token.type){
			case "operand":
				stack.push({name: token.value, children: []});
			break
			case "operator":
				second_operand = stack.pop();
				first_operand = stack.pop();
				if (first_operand === undefined || second_operand===undefined){
					throw {status: "error", reason: "Incorrect Operator Use"};
				}
				stack.push({name: token.value, children:[first_operand,second_operand]});
			break
		}
	}
	if (stack.length>1) {
		throw {status: "error", reason: "Incorrect Operator Use"};
	} 
	return stack.pop();
}

function print_svg_tree(root){
	var width = 650;
    var height = 700;
    var margin = 100

    var tree = d3.layout.tree()
            .size([height-50, width-margin]);

    var diagonal = d3.svg.diagonal()
            .projection(function(d) { return [d.y, d.x]; });

    var svg = d3.select("#result").append("svg")
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", "translate(30,10)");

    var nodes = tree.nodes(root);
	var links = tree.links(nodes);
	var link = svg.selectAll(".link")
                    .data(links)
                    .enter().append("path")
                    .attr("class", "link")
                    .attr("d", diagonal)
                    .style("fill","none")
					.style("stroke","#ccc")
					.style("stroke-width","1.5px");

    var node = svg.selectAll(".node")
                    .data(nodes)
                    .enter().append("g")
                    .attr("class", "node")
                    .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; })
                    .style("font","15px sans-serif")

    node.append("circle")
                    .attr("r", 20)
					.style("fill","#fff")
					.style("stroke","steelblue")
					.style("stroke-width","1.5px");

    node.append("text")
            //.attr("dx", function(d) { return d.children ? -8 : 8; })
            .attr("dx", function(d) { return -4; })
            .attr("dy", 5)
            .style("text-anchor", function(d) { return d.children ? "end" : "start"; })
            .text(function(d) { return d.name; });
    d3.select(self.frameElement).style("height", height + "px");
}

function node_clone(node1){
	return JSON.parse( JSON.stringify( node1 ) );
}
function node_is_equal(node1, node2){
	return JSON.stringify(node1)==JSON.stringify(node2);
}

function send_history(type, expr, result_type, result){
	$.ajax({
	  url: "history.php",
	  context: document.body,
	  type: "POST",
	  data: {type: type, expr: expr, result_type: result_type, result:result},
	  success: function(returnValue){
            console.log(returnValue);
        },
      error: function(request,error) {
            console.log('An error occurred attempting to get new e-number');
    	}
	})
}