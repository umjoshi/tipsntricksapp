$(document).ready(function () {
    var url = "/getEntries"
    var tableBody = $("#tipsAndTricksTableBody");
    var order = ["serialNumber", "tip", "value"];

    $.getJSON(url).done(function (data) {
        console.debug("json data is: " + data);
        tableBody.empty();
        populateTableBody(data);
    });

    function populateTableBody(data) {
        data.forEach(function (item) {
            var row = $("<tr></tr>");
            order.forEach(function (colName) {
                var value = item[colName];
                row.append(createCol(value, colName));
            });
            tableBody.append(row);
        });
    }

    function createCol(data, colName) {
        var col = $("<td></td>").addClass(colName);
        col.text(data);
        return col;
    }

    $('#confirmAddEntry').click(function () {
        var tipTextAreaValue = $('#tipTextArea').val();
        var valueTextAreaValue = $('#valueTextArea').val();

        var entryInJSONFormat = JSON.parse(JSON.stringify({"tip": tipTextAreaValue, "value": valueTextAreaValue}));

        $.post("/addEntry", entryInJSONFormat)
                .done(function (result) {
                    if (result === "entry_added") {
                        alert("Tip added successfully");
                        window.location.href = "index.html";
                    } else {
                        window.location.href = "error.html";
                    }
                });
    });
});