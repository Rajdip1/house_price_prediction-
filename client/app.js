// ===== helper functions =====
function getBathValue() {
  var uiBathrooms = document.getElementsByName("uiBathrooms");
  for (var i = 0; i < uiBathrooms.length; i++) {
    if (uiBathrooms[i].checked) {
      return parseInt(uiBathrooms[i].value);
    }
  }
  return -1; // Invalid Value
}

function getBHKValue() {
  var uiBHK = document.getElementsByName("uiBHK");
  for (var i = 0; i < uiBHK.length; i++) {
    if (uiBHK[i].checked) {
      return parseInt(uiBHK[i].value);
    }
  }
  return -1; // Invalid Value
}

// ===== estimate button handler (enhanced with loading + animation) =====
function onClickedEstimatePrice() {
  console.log("Estimate price button clicked");

  // try to find button by id, fallback to class .submit if id not present
  const btn = document.getElementById("estimateBtn") || document.querySelector(".submit");
  const resultBox = document.getElementById("uiEstimatedPrice");

  // Basic validation
  const sqftEl = document.getElementById("uiSqft");
  const locationEl = document.getElementById("uiLocations");
  const sqftVal = sqftEl ? parseFloat(sqftEl.value) : NaN;
  const bhk = getBHKValue();
  const bathrooms = getBathValue();
  const location = locationEl ? locationEl.value : "";

  if (isNaN(sqftVal) || sqftVal <= 0) {
    resultBox.innerHTML = "<p style='color:#b91c1c;font-weight:700'>Enter valid area (sqft)</p>";
    return;
  }
  if (!location) {
    resultBox.innerHTML = "<p style='color:#b91c1c;font-weight:700'>Select a location</p>";
    return;
  }

  // UI: show loading state
  if (btn) {
    btn.disabled = true;
    // store original text so we can restore it
    if (!btn.dataset.origText) btn.dataset.origText = btn.innerText;
    btn.innerText = "Estimating...";
  }
  // clear previous result & prep fade
  resultBox.style.transition = "none";
  resultBox.style.opacity = 0;
  resultBox.innerHTML = "";

  const url = "/api/predict_home_price";
 // const url = "http://127.0.0.1:5000/predict_home_price"; // adjust if using nginx/proxy

  $.post(
    url,
    {
      total_sqft: sqftVal,
      bhk: bhk,
      bath: bathrooms,
      location: location,
    },
    function (data, status) {
      console.log("response:", data, status);

      // if API returns error-ish structure, handle gracefully
      if (!data || (data.estimated_price === undefined && data.error)) {
        const msg = data && data.error ? data.error : "No estimated_price in response";
        resultBox.innerHTML = `<p style='color:#b91c1c;font-weight:700'>${msg}</p>`;
        if (btn) {
          btn.disabled = false;
          btn.innerText = btn.dataset.origText || "Estimate Price";
        }
        resultBox.style.opacity = 1;
        return;
      }

      // show result and fade in
      const priceText = `${data.estimated_price.toString()} Lakh`;
      resultBox.innerHTML = `<h2 style="margin:0">${priceText}</h2>`;

      // small timeout to allow DOM update then animate
      setTimeout(() => {
        resultBox.style.transition = "opacity 0.45s ease";
        resultBox.style.opacity = 1;
      }, 60);

      // restore button
      if (btn) {
        btn.disabled = false;
        btn.innerText = btn.dataset.origText || "Estimate Price";
      }
    }
  ).fail(function (xhr, status, error) {
    console.error("Request failed:", status, error);
    resultBox.innerHTML = "<p style='color:#b91c1c;font-weight:700'>Error estimating price. Try again.</p>";
    resultBox.style.transition = "opacity 0.25s ease";
    resultBox.style.opacity = 1;
    if (btn) {
      btn.disabled = false;
      btn.innerText = btn.dataset.origText || "Estimate Price";
    }
  });
}

// ===== load locations on page load =====
function onPageLoad() {
  console.log("document loaded");
  var url = "/api/get_locations_name";
  //var url = "http://127.0.0.1:5000/get_locations_name";
  $.get(url, function (data, status) {
    console.log("got response for get_location_names request", status, data);
    if (data) {
      var locations = data.locations || data.location; // tolerate both keys
      var uiLocations = document.getElementById("uiLocations");
      $('#uiLocations').empty();
      // optional placeholder
      $('#uiLocations').append(new Option("Choose a Location", "", true, true));
      for (var i = 0; i < locations.length; i++) {
        var opt = new Option(locations[i], locations[i]);
        $('#uiLocations').append(opt);
      }
    } else {
      console.error("No data returned from get_locations_name");
    }
  }).fail(function (xhr, status, err) {
    console.error("Failed to load locations:", status, err);
  });
}

window.onload = onPageLoad;
