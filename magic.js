// constant to determine how the file gets segmented
// to make your lives a little easier, we wil keep a fixed block size
// if you want a challenge, add a control and let the user change this on the fly...
const WORDS_PER_BLOCK = 200;

const visArea = d3.select('#text-vis');
const color_scale = d3.scaleLinear();
const color_scale2 = d3.scaleLinear();

// the master collection of records to be visualized
const master_file_list = [];
var res = [];
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
    // what kind of fingerprinting are we doing?
    const fingerprint_type = document.getElementById('fingerprint_type').value;

    const gridChart = visArea.selectAll(".vis")
      .data(master_file_list)
      .enter()
      .append("div")
      .classed("vis", true);

    visArea.selectAll('.vis').each(function(dataEachFile) {

        const showAverageLength = function() {

            let min = d3.min(dataEachFile, (eachObj) => eachObj["meanLength"]);
            let max = d3.max(dataEachFile, (eachObj) => eachObj["meanLength"]);

            color_scale.range(["red", "yellow", "green"])
              .domain([min, (min + max) / 2, max]);

            chart = d3.select(this);
            // used to write gridChart here. 
            chart.html("");

            chart.selectAll(".avgL")
              .data((dataEachFile) => dataEachFile)
              .enter()
              .append("div").classed("avgL", true)
              .style("background-color", (eachObj) => color_scale(eachObj["meanLength"]));

        };

        const showUnique = function() {

            let min = d3.min(dataEachFile, (eachObj) => eachObj["uniquenessCount"]);
            let max = d3.max(dataEachFile, (eachObj) => eachObj["uniquenessCount"]);

            color_scale.range(["red", "yellow", "green"])
              .domain([min, (min + max) / 2, max]);

            chart = d3.select(this);

            chart.html("");

            chart.selectAll(".hapax")
              .data((dataEachFile) => dataEachFile)
              .enter()
              .append("div").classed("hapax", true)
              .style("background-color", (eachObj) => color_scale(eachObj["uniquenessCount"]));
        };

        if (fingerprint_type == "avg_length") {
                showAverageLength(dataEachFile);
        }
        else if (fingerprint_type == "unique") {
                showUnique(dataEachFile);
        }

    });


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

const process_text_data = function(file_name, contents){
    res = [];

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

        res.push({
          "fileName": file_name,
          "meanLength": calcAvgLength(tempArray),
          "uniquenessCount": countUnique(tempArray, uniqueList)
        });
    }

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
            return (event) => resolve(process_text_data(file_data.name, event.target.result));
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
    alert("I'm changed!");
    update_visualization();

});
