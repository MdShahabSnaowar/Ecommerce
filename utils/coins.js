const SuperCoinSchema = require("../models/SuperCoinSchema");

const addCoinsToUser = async (
  userId,
  coins,
  type = "registration",
  description = ""
) => {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30); // Coins expire after 30 days

  const coinEntry = {
    type,
    coins,
    description,
    createdAt: new Date(),
    expiresAt,
  };

  let superCoin = await SuperCoinSchema.findOne({ userId });

  if (!superCoin) {
    superCoin = await SuperCoinSchema.create({
      userId,
      coins,
      history: [coinEntry],
    });
  } else {
    superCoin.coins += coins;
    superCoin.history.push(coinEntry);
    await superCoin.save();
  }

  return superCoin;
};

module.exports = { addCoinsToUser };
