(function () {
  "use strict";

  const buttonLoading = document.querySelector("button#loading-price");
  const priceBitcoin = document.querySelector("#priceBitcoin");

  priceBitcoin.addEventListener("keyup", function (event) {
    let priceBitcoin = event.target.value;
    let valueTransaction = document.querySelector("#amount").value;

    let calc = (parseFloat(valueTransaction) * 1) / parseFloat(priceBitcoin);

    document.querySelector("#qtyBitcoin").value = !isNaN(calc) ? calc : 0;
  });

  buttonLoading &&
    buttonLoading.addEventListener("click", async function (event) {
      try {
        const formData = new FormData(
          document.querySelector("form#form-transaction")
        );
        if (
          formData.get("created_at").length > 0 &&
          formData.get("amount").length > 0
        ) {
          const response = await fetch(rootURL + "/transactions/get-price", {
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
            method: "POST",
            body: JSON.stringify({
              created_at: formData.get("created_at"),
              amount: formData.get("amount"),
            }),
          });
          const { data } = await response.json();

          renderPreview(data);
        } else {
          alert("Enter date and value to transaction");
        }
      } catch (error) {
        console.log(error);
      }
    });

  function renderPreview(data) {
    document.querySelector("#qtyBitcoin").value = data.qtyBitcoin;
    document.querySelector("#priceBitcoin").value = data.priceValue;
    document.querySelector("#btn-submit").classList.remove("d-none");
  }
})();
