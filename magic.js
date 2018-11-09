// constant to determine how the file gets segmented
// to make your lives a little easier, we wil keep a fixed block size
// if you want a challenge, add a control and let the user change this on the fly...
const WORDS_PER_BLOCK = 200;

const visArea = d3.select('#text-vis');
const color_scale = d3.scaleLinear();
const color_scale2 = d3.scaleLinear();
const legSvg = visArea.append("svg");
const legRect = legSvg.append("g");
const legText = legSvg.append("g");

// the master collection of records to be visualized
const master_file_list = [];
/*
    Redraw the visualization using the current state of the master_list.

    We could be here because
    - we added some new files
    - we removed a file
    - we changed the fingerprint type
*/

/*
"fileName": file_name,
"meanLength": calcAvgLength(tempArray),
"uniquenessCount": countUnique(tempArray, uniqueList)
*/
const update_visualization = function(){
    var minML = 2147483647, maxML = -1, minUC = 2147483647, maxUC = -1;

    /*
    ** Some prep functions
    */
    for (let i = 0; i < master_file_list.length; i++) {
        maxML = Math.max(maxML, d3.max(master_file_list[i]["meanLength"], (d) => d));
        minML = Math.min(minML, d3.min(master_file_list[i]["meanLength"], (d) => d));
        maxUC = Math.max(maxUC, d3.max(master_file_list[i]["uniqueCount"], (d) => d));
        minUC = Math.min(minUC, d3.min(master_file_list[i]["uniqueCount"], (d) => d));
    }

    const createLegend = function(min, max){
        var colorArray = new Array(5);
        for (i = 0; i <= 5; i++){
            colorArray[i] = min + (max - min) * i / 5;
        }

        rects = legRect.selectAll("rect").data(colorArray, (d) => d);
        texts = legText.selectAll("text").data(colorArray, (d) => d);

        rects.exit().remove();
        texts.exit().remove();

        rects.enter()
            .append("rect")
            .attr("x", 0)
            .attr("y", (d, i)=> i * 20)
            .attr("height", 15)
            .attr("width", 15)
            .attr("fill", (d) => color_scale(d));

        texts.enter()
          .append("text")
          .text((d) => d)
          .attr("x", 30)
          .attr("y", (d, i)=> i * 20)
          .attr("transform", `translate(0, 13)`)
          .style("font-size", 15);

        legSvg.attr("transform", `translate(500, 0)`);
    }

    /*
    ** Here we go
    */

    // what kind of fingerprinting are we doing?
    const fingerprint_type = document.getElementById('fingerprint_type').value;

    const chartDiv = visArea.selectAll(".vis")
      .data(master_file_list, (d) => d.id);

    chartDiv.exit().remove();

    newDiv = chartDiv.enter().append("div")
      .classed("vis", true);

    const showAverage = function(eachFile, i, dom) {

        color_scale.range(["red", "yellow", "green"])
          .domain([minML, (minML + maxML) / 2, maxML]);


        d3.select(dom).html("");

        d3.select(dom).append("svg").append("g")
          .selectAll(".avg")    // small blocks
          .data((d) => d["meanLength"])
          .enter()
          .append("rect")
          .classed("avg", true)
          .attr("x", (d, i) => (i % 50) * 10)
          .attr("y", (d, i) => (Math.floor(i / 50) * 10))
          .attr("width", 10)
          .attr("height", 10)
          .attr("fill", (d) => color_scale(d));

    }

    const showUnique = function(eachFile, i, dom) {

        color_scale.range(["red", "yellow", "green"])
          .domain([minUC, (minUC + maxUC) / 2, maxUC]);

        d3.select(dom).html("");

        d3.select(dom).append("svg").append("g")
          .selectAll(".hapax")    // small blocks
          .data((d) => d["uniqueCount"])
          .enter()
          .append("rect")
          .classed("hapax", true)
          .attr("x", (d, i) => (i % 50) * 10)
          .attr("y", (d, i) => (Math.floor(i / 50) * 10))
          .attr("width", 10)
          .attr("height", 10)
          .attr("fill", (d) => color_scale(d));
    }

    if (fingerprint_type == "avg_length") {
        chartDiv.each(function(eachFile, i){
            showAverage(eachFile, i, this);
        });
        newDiv.each(function(eachFile, i){
            showAverage(eachFile, i, this);
        });

        createLegend(minML, maxML);

    }
    else if (fingerprint_type == "unique") {
        chartDiv.each(function(eachFile, i){
            showUnique(eachFile, i, this);
        });
        newDiv.each(function(eachFile, i){
            showUnique(eachFile, i, this);
        });

        createLegend(minUC, maxUC); 
    }

};


function calcAvgLength(subarray) {
      count = 0;
      for (var i = 0; i < subarray.length; i++){
          count += subarray[i].length;
      }
      return count/subarray.length;
}

function findUniques(wordArray) {
    // return an array of words that are unique
    uniqueList = [];
    nestedByWord = d3.nest().key((d)=> d).entries(wordArray);
    for(var i = 0; i < nestedByWord.length; i++){
        if (nestedByWord[i].values.length == 1){
          uniqueList.push(nestedByWord[i].key);
        }
    }
    return uniqueList;
}

function countUnique(subarray, uniqueL) {
    count = 0;
    for(var i = 0; i < subarray.length; i++){ // for each 200 word block
      for(var j = 0; j < uniqueL.length; j++){ // for each word in unique list
        // check if there are any matches
        if (subarray[i] == uniqueL[j]){
          count++;
        }
      }
    }

    return count;
}

/*
    The bundleTextData function takes in a name and the contents of the associated file. The function should process the text and return an object containing (at minimum), the name of a file, and a list of segment values for each metric.
*/

const process_text_data = function(file_name, contents, id){
    var res = {
      "fileName": "",
      "meanLength": [],
      "uniqueCount": [],
      "id": id
    };

    var arr1 = [], arr2 = []

    var wordArray = contents.split(/\s+/);
    var uniqueList = findUniques(wordArray);

    for (var i = 0; i < wordArray.length; i++){
        wordArray[i] = wordArray[i].replace(/(^(\W|\d)+|\W+$)/g, "");
        wordArray[i] = wordArray[i].toLowerCase();
    }

    for (var i = 0; i < wordArray.length; i += WORDS_PER_BLOCK) {
        var tempArray = [];
        if (i + WORDS_PER_BLOCK < wordArray.length) {
            tempArray = wordArray.slice(i, i + WORDS_PER_BLOCK);
        }
        else {
            tempArray = wordArray.slice(i);
        }

        arr1.push(calcAvgLength(tempArray));
        arr2.push(countUnique(tempArray, uniqueList));

    }
    res["fileName"] = file_name;
    res["meanLength"] = arr1;
    res["uniqueCount"] = arr2;

    return res;

};



/*
    This function does the voodoo of "uploading" the files into the browser. You don't need to know exactly what is going on in here. The important parts are that when the user selects multiple files, this will read those files in, passing each one to process_text_data() for you to process. When they have all been processed, it will then call drawTextVis() with a list of all of the objects you produced in the process_text_data() function.
*/
const handle_file_select = function(evt) {
    const files = evt.target.files; // FileList object

    const load_list = [];

    for (let i = 0, f; f = files[i]; i++) {
        const p = new Promise(function(resolve, reject){
        const reader = new FileReader();

        reader.onload = function(file_data){
            return (event) => resolve(process_text_data(file_data.name, event.target.result, i));
            }(f);
        reader.readAsText(f);

        });
        load_list.push(p);
    }

    Promise.all(load_list).then(function(processed_records){

        for (let i =0; i < processed_records.length; i++){
            master_file_list.push(processed_records[i]);
        }

        update_visualization();
    });

};

// add the event listener for the file addition button
document.getElementById('files').addEventListener('change', handle_file_select, false);

// add the event listener for changing the fingerprint type
document.getElementById('fingerprint_type').addEventListener('change', function(event){
    update_visualization();

});
