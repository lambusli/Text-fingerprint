/*
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
*/
