
function handle(){
	var expr = $("#expression")[0].value;
	$("#result")[0].innerHTML=""
	try {
		result_tree = parse_rational(expr);
		draw_d3(result_tree);
		svg_code = (new XMLSerializer).serializeToString($("svg")[0])
		$.ajax({
		  url: "history.php",
		  context: document.body,
		  type: "POST",
		  data: {type: "graph", expr: expr, result_status: "success" result:svg_code},
		  success: function(returnValue){
	            console.log(returnValue);
	            return returnValue; //with return value excecute code
            },
          error: function(request,error) {
	            console.log('An error occurred attempting to get new e-number');
        	}
		})

	} catch (e) {
		if (e.reason !== undefined){
			$("#result")[0].innerHTML="<p>Error: "+e.reason+"</p>"
			$.ajax({
			  url: "history.php",
			  context: document.body,
			  type: "POST",
			  data: {type: "graph", expr: expr, result_status: "error" result:e.reason},
			  success: function(returnValue){
		            console.log(returnValue);
		            return returnValue; //with return value excecute code
	            },
	          error: function(request,error) {
		            console.log('An error occurred attempting to get new e-number');
        	}
		})	
		} else {
			throw e;
		}
	}
}
function parse_rational(expr) {
	lexem_arr = lexify(expr);
	if (!lexem_arr.length) {
		throw {status: "error", reason: "Expression Is Empty"};
	}
	polish_arr = translate_polish(lexem_arr);
	tree = build_tree(polish_arr);
	return tree
}

function translate_polish(lexemes) {
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

function is_operand(lexem){return RegExp("^[A-Za-z]$").test(lexem)}
function is_operator(lexem){return RegExp("^[\+|\-|\*|\/|\(|\)]$").test(lexem)}

function lexify(expr){
	var result = new Array();
	var temp = "";
	for (var i = 0; i<expr.length; i++){
		if (is_operand(expr[i])) {
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
				case "(":
					result.push({type: "left_bracket", value: expr[i]});
				break
				case ")":
					result.push({type: "right_bracket", value: expr[i]});
				break
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

function build_tree(polish_arr) {
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

function draw_d3(root){
	var width = 800;
    var height = 550;
    var margin = 100

    var tree = d3.layout.tree()
            .size([height, width-margin]);

    var diagonal = d3.svg.diagonal()
            .projection(function(d) { return [d.y, d.x]; });

    var svg = d3.select("#result").append("svg")
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", "translate(30,0)");

    var nodes = tree.nodes(root);
	var links = tree.links(nodes);
	var link = svg.selectAll(".link")
                    .data(links)
                    .enter().append("path")
                    .attr("class", "link")
                    .attr("d", diagonal);

    var node = svg.selectAll(".node")
                    .data(nodes)
                    .enter().append("g")
                    .attr("class", "node")
                    .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; })

    node.append("circle")
                    .attr("r", 20);

    node.append("text")
            //.attr("dx", function(d) { return d.children ? -8 : 8; })
            .attr("dx", function(d) { return -4; })
            .attr("dy", 5)
            .style("text-anchor", function(d) { return d.children ? "end" : "start"; })
            .text(function(d) { return d.name; });
    d3.select(self.frameElement).style("height", height + "px");
}