const { validationResult } = require("express-validator");
const fsPromises = require("fs/promises");
const path = require("path");
const connection = require("../data/database");
const { format } = require("date-fns");
const carboneSDK = require("carbone-sdk")(process.env.CARBON_PROD_KEY);
const fs = require("fs");


exports.generateDocument = async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    // Fetch the form data
    const formID = Number(req.body.formDataID);
    const formData = await getFormData(formID);
    if (!formData) {
      return res.status(404).json({ error: "Form data not found" });
    }

    // Set the data template
    const data = templateData(
      formData,
    );

    // Set carbone options
    const options = {
      data: data,
      convertTo: "docx" // Change to "pdf" when ready
    };

    // Get the path of the existing docx template
    const templatePath = path.resolve(__dirname, "../templates", "Template.docx");

    // Render the user input on the docx template
    carboneSDK.render(templatePath, options, function (err, result) {
      if (err) {
        return console.error(err);
      }

      // Set the output path
      const outputPath = path.resolve(__dirname, "../templates/completed", `${formData.clientName}.docx`);

      // Write the rendered document
      fsPromises.writeFile(outputPath, result).then(() => {
        const formattedStartDate = format(new Date(), "dd/MM/yyyy");

        // Store document info
        storeDocumentInfo(outputPath, formData.clientName, formattedStartDate, userID, formID).then(documentCreated => {
          if (!documentCreated) {
            return res.status(204).json({ error: "Form data not found" });
          }
          res.status(200).json({ message: "success", documentID: documentCreated });
        }).catch(writeErr => {
          console.error("Error storing document info:", writeErr);
          if (!res.headersSent) {
            next(writeErr);
          }
        });
      }).catch(writeErr => {
        console.error("Error writing file:", writeErr);
        if (!res.headersSent) {
          next(writeErr);
        }
      });
    });
  } catch (err) {
    if (!res.headersSent) {
      next(err);
    }
  }
};




function templateData(formData) {
  // Implement template data structure based on your requirements
}
