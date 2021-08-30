const { ApiPromise, WsProvider } = require('@polkadot/api');
const { Keyring } = require('@polkadot/keyring');
const BN = require('bn.js');

const BOB = '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty';

async function main () {
  const provider = new WsProvider('ws://127.0.0.1:9944');
  const api = await ApiPromise.create(provider);
  const keyring = new Keyring();
  let accounts = [];
  accounts.push(keyring.addFromMnemonic('enhance embody priority wise tree pig trash reform drum sure zebra canoe', {"name": "test5"}, "sr25519"));
  accounts.push(keyring.addFromMnemonic('game scissors wet budget cradle coil iron quantum chapter dismiss spring catch', {"name": "test6"}, "sr25519"));
  accounts.push(keyring.addFromMnemonic('property rocket unlock wrap shoot useful drip brown genius kingdom keen scan', {"name": "test7"}, "sr25519"));
  accounts.push(keyring.addFromMnemonic('catalog double brother describe orchard kidney want pupil place debris either coral', {"name": "test8"}, "sr25519"));
  console.time('Transactions sent to the node in');
  for (let i = 0; i < accounts.length; i++) {
    // console.log(api.query.system.account.nonce)
    let { nonce, data: balance } = await api.query.system.account(keyring.getPairs()[i].address);
    // let rawNonce = await api.query.system.account.nonce(keyring.getPairs()[i].address);
    nonce = new BN(nonce.toString());
    for (let j = 0; j < 250; j++) {
      const transfer = api.tx.balances.transfer(BOB, 1000);
      transfer.signAndSend(accounts[i], { nonce });
      nonce = nonce.add(new BN(1));
    }
  }
  const unsub = await api.rpc.chain.subscribeNewHeads((header) => {
    console.log("Block " + header.blockNumber + " Mined.");
  });
  console.timeEnd('Transactions sent to the node in');
  let i = 0;
  let j = 0;
  let oldPendingTx = 0;
  let interval = setInterval(async () => {
    await api.rpc.author.pendingExtrinsics((extrinsics) => {
      i++;
      j++;
      if (oldPendingTx > extrinsics.length) {
        console.log("Approx TPS: ", (oldPendingTx - extrinsics.length)/j);
        j = 0;
      }
      if(extrinsics.length === 0){
        console.log(i + " Second passed, No pending extrinsics in the pool.");
        clearInterval(interval);
        unsub();
        process.exit();
      }
      console.log(i + " Second passed, " + extrinsics.length + " pending extrinsics in the pool");
      oldPendingTx = extrinsics.length;
    });
  }, 1000);
}

main().catch(console.error);