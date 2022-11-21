const { default: axios } = require("axios");

exports.getBuy = async () => {
  try {
    const data = await axios.get(
      "https://www.mercadobitcoin.net/api/BTC/ticker/"
    );

    const { ticker } = data.data;

    return ticker?.buy || 0;
  } catch (error) {
    console.error(error);
    return 0;
  }
};

exports.getAvgPrice = async created_at => {
  try {
    const dateArr = created_at.split("-");

    const { data } = await axios.get(
      `https://www.mercadobitcoin.net/api/BTC/day-summary/${dateArr[0]}/${dateArr[1]}/${dateArr[2]}/`
    );

    return data || {};
  } catch (error) {
    console.error(error);
    return {};
  }
};
