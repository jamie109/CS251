// =================== CS251 DEX Project =================== // 
//        @authors: Simon Tao '22, Mathew Hogan '22          //
// ========================================================= //                  

// Set up Ethers.js
const provider = new ethers.providers.JsonRpcProvider("http://localhost:8545");
var defaultAccount;

const exchange_name = '';             // TODO: fill in the name of your exchange

const token_name = '';                // TODO: replace with name of your token
const token_symbol = '';              // TODO: replace with symbol for your token


// =============================================================================
//                          ABIs: Paste Your ABIs Here
// =============================================================================

// TODO: Paste your token and exchange contract ABIs in abi.js!

// TODO: Paste your token contract address here: 
const token_address = '';      
const token_abi = [];             
const token_contract = new ethers.Contract(token_address, token_abi, provider.getSigner());

// TODO: Paste your exchange address here
const exchange_abi = [];
const exchange_address = '';                
const exchange_contract = new ethers.Contract(exchange_address, exchange_abi, provider.getSigner());



// =============================================================================
//                              Provided Functions
// =============================================================================
// Reading and understanding these should help you implement the above

/*** INIT ***/
async function init() {
    var poolState = await getPoolState();
    console.log("starting init");
    if (poolState['token_liquidity'] === 0
            && poolState['eth_liquidity'] === 0) {
      // Call mint twice to make sure mint can be called mutliple times prior to disable_mint
      const total_supply = 100000;
      await token_contract.connect(provider.getSigner(defaultAccount)).mint(total_supply / 2);
		  await token_contract.connect(provider.getSigner(defaultAccount)).mint(total_supply / 2);
		  await token_contract.connect(provider.getSigner(defaultAccount)).disable_mint();
      await token_contract.connect(provider.getSigner(defaultAccount)).approve(exchange_address, total_supply);
      // initialize pool with equal amounts of ETH and tokens, so exchange rate begins as 1:1
      await exchange_contract.connect(provider.getSigner(defaultAccount)).createPool(5000, { value: ethers.utils.parseUnits("5000", "wei")});
      console.log("init finished");

       // All accounts start with 0 of your tokens. Thus, be sure to swap before adding liquidity.
    }
}

async function getPoolState() {
    // read pool balance for each type of liquidity:
    let liquidity_tokens = await token_contract.connect(provider.getSigner(defaultAccount)).balanceOf(exchange_address);
    let liquidity_eth = await provider.getBalance(exchange_address);
    return {
        token_liquidity: Number(liquidity_tokens),
        eth_liquidity: Number(liquidity_eth),
        token_eth_rate: Number(liquidity_tokens) / Number(liquidity_eth),
        eth_token_rate: Number(liquidity_eth) / Number(liquidity_tokens)
    };
}

// ============================================================
//                    FUNCTIONS TO IMPLEMENT
// ============================================================

// Note: maxSlippagePct will be passed in as an int out of 100. 
// Be sure to divide by 100 for your calculations.

/*** ADD LIQUIDITY ***/
async function addLiquidity(amountEth, maxSlippagePct) {
    /** TODO: ADD YOUR CODE HERE **/
   
}

/*** REMOVE LIQUIDITY ***/
async function removeLiquidity(amountEth, maxSlippagePct) {
    /** TODO: ADD YOUR CODE HERE **/
    
}

async function removeAllLiquidity(maxSlippagePct) {
    /** TODO: ADD YOUR CODE HERE **/
   
}

/*** SWAP ***/
async function swapTokensForETH(amountToken, maxSlippagePct) {
    /** TODO: ADD YOUR CODE HERE **/
   
}

async function swapETHForTokens(amountEth, maxSlippagePct) {
    /** TODO: ADD YOUR CODE HERE **/
   
}

// =============================================================================
//                                      UI
// =============================================================================


// This sets the default account on load and displays the total owed to that
// account.
provider.listAccounts().then((response)=> {
    defaultAccount = response[0];
    // Initialize the exchange
    init().then(() => {
        // fill in UI with current exchange rate:
        getPoolState().then((poolState) => {
            $("#eth-token-rate-display").html("1 ETH = " + poolState['token_eth_rate'] + " " + token_symbol);
            $("#token-eth-rate-display").html("1 " + token_symbol + " = " + poolState['eth_token_rate'] + " ETH");

            $("#token-reserves").html(poolState['token_liquidity'] + " " + token_symbol);
            $("#eth-reserves").html(poolState['eth_liquidity'] + " ETH");
        });
    });
});

// Allows switching between accounts in 'My Account'
provider.listAccounts().then((response)=>{
    var opts = response.map(function (a) { return '<option value="'+
            a.toLowerCase()+'">'+a.toLowerCase()+'</option>' });
    $(".account").html(opts);
});

// This runs the 'swapETHForTokens' function when you click the button
$("#swap-eth").click(function() {
    defaultAccount = $("#myaccount").val(); //sets the default account
  swapETHForTokens($("#amt-to-swap").val(), $("#max-slippage-swap").val()).then((response)=>{
        window.location.reload(true); // refreshes the page after add_IOU returns and the promise is unwrapped
    })
});

// This runs the 'swapTokensForETH' function when you click the button
$("#swap-token").click(function() {
    defaultAccount = $("#myaccount").val(); //sets the default account
  swapTokensForETH($("#amt-to-swap").val(), $("#max-slippage-swap").val()).then((response)=>{
        window.location.reload(true); // refreshes the page after add_IOU returns and the promise is unwrapped
    })
});

// This runs the 'addLiquidity' function when you click the button
$("#add-liquidity").click(function() {
    console.log("Account: ", $("#myaccount").val());
    defaultAccount = $("#myaccount").val(); //sets the default account
  addLiquidity($("#amt-eth").val(), $("#max-slippage-liquid").val()).then((response)=>{
        window.location.reload(true); // refreshes the page after add_IOU returns and the promise is unwrapped
    })
});

// This runs the 'removeLiquidity' function when you click the button
$("#remove-liquidity").click(function() {
    defaultAccount = $("#myaccount").val(); //sets the default account
  removeLiquidity($("#amt-eth").val(), $("#max-slippage-liquid").val()).then((response)=>{
        window.location.reload(true); // refreshes the page after add_IOU returns and the promise is unwrapped
    })
});

// This runs the 'removeAllLiquidity' function when you click the button
$("#remove-all-liquidity").click(function() {
    defaultAccount = $("#myaccount").val(); //sets the default account
  removeAllLiquidity($("#max-slippage-liquid").val()).then((response)=>{
        window.location.reload(true); // refreshes the page after add_IOU returns and the promise is unwrapped
    })
});

$("#swap-eth").html("Swap ETH for " + token_symbol);

$("#swap-token").html("Swap " + token_symbol + " for ETH");

$("#title").html(exchange_name);


// This is a log function, provided if you want to display things to the page instead of the JavaScript console
// Pass in a discription of what you're printing, and then the object to print
function log(description, obj) {
    $("#log").html($("#log").html() + description + ": " + JSON.stringify(obj, null, 2) + "\n\n");
}


// =============================================================================
//                                SANITY CHECK
// =============================================================================
function check(name, swap_rate, condition) {
	if (condition) {
		console.log(name + ": SUCCESS");
		return (swap_rate == 0 ? 6 : 10);
	} else {
		console.log(name + ": FAILED");
		return 0;
	}
}


const sanityCheck = async function() {
    var swap_fee = await exchange_contract.connect(provider.getSigner(defaultAccount)).getSwapFee();
    console.log("Beginning Sanity Check.");

    var accounts = await provider.listAccounts();
    defaultAccount = accounts[0];
    var score = 0;
    var start_state = await getPoolState();
    var start_tokens = await token_contract.connect(provider.getSigner(defaultAccount)).balanceOf(defaultAccount);

    // No liquidity provider rewards implemented yet
    if (Number(swap_fee[0]) == 0) {
        await swapETHForTokens(100, 1);
        var state1 = await getPoolState();
        var expected_tokens_received = 100 * start_state.token_eth_rate;
        var user_tokens1 = await token_contract.connect(provider.getSigner(defaultAccount)).balanceOf(defaultAccount);
        score += check("Testing simple exchange of ETH to token", swap_fee[0],
          Math.abs((start_state.token_liquidity - expected_tokens_received) - state1.token_liquidity) < 5 &&
          (state1.eth_liquidity - start_state.eth_liquidity) === 100 &&
          Math.abs(Number(start_tokens) + expected_tokens_received - Number(user_tokens1)) < 5);
        
        await swapTokensForETH(100, 1);
        var state2 = await getPoolState();
        var expected_eth_received = 100 * state1.eth_token_rate;
        var user_tokens2 = await token_contract.connect(provider.getSigner(defaultAccount)).balanceOf(defaultAccount);
        score += check("Test simple exchange of token to ETH", swap_fee[0], 
          state2.token_liquidity === (state1.token_liquidity + 100) && 
          Math.abs((state1.eth_liquidity - expected_eth_received) - state2.eth_liquidity) < 5 &&
          Number(user_tokens2) === (Number(user_tokens1) - 100));
        
        await addLiquidity(100, 1);
        var expected_tokens_added = 100 * state2.token_eth_rate;
        var state3 = await getPoolState();
        var user_tokens3 = await token_contract.connect(provider.getSigner(defaultAccount)).balanceOf(defaultAccount);
        score += check("Test adding liquidity", swap_fee[0], 
          state3.eth_liquidity === (state2.eth_liquidity + 100) &&
          Math.abs(state3.token_liquidity - (state2.token_liquidity + expected_tokens_added)) < 5 &&
          Math.abs(Number(user_tokens3) - (Number(user_tokens2) - expected_tokens_added)) < 5);
        
        await removeLiquidity(10, 1);
        var expected_tokens_removed = 10 * state3.token_eth_rate;
        var state4 = await getPoolState();
        var user_tokens4 = await token_contract.connect(provider.getSigner(defaultAccount)).balanceOf(defaultAccount);
        score += check("Test removing liquidity", swap_fee[0], 
          state4.eth_liquidity === (state3.eth_liquidity - 10) &&
          Math.abs(state4.token_liquidity - (state3.token_liquidity - expected_tokens_removed)) < 5 &&
          Math.abs(Number(user_tokens4) - (Number(user_tokens3) + expected_tokens_removed)) < 5);

        await removeAllLiquidity(1);
        expected_tokens_removed = 90 * state4.token_eth_rate;
        var state5 = await getPoolState();
        var user_tokens5 = await token_contract.connect(provider.getSigner(defaultAccount)).balanceOf(defaultAccount);
        score += check("Test removing all liquidity", swap_fee[0], 
          state5.eth_liquidity - (state4.eth_liquidity - 90) < 5 && 
          Math.abs(state5.token_liquidity - (state4.token_liquidity - expected_tokens_removed)) < 5 &&
          Math.abs(Number(user_tokens5) - (Number(user_tokens4) + expected_tokens_removed)) < 5); 
    }

    // LP provider rewards implemented
    else {
        var swap_fee = swap_fee[0] / swap_fee[1];
        console.log("swap fee: ", swap_fee);

        await swapETHForTokens(100, 1);
        var state1 = await getPoolState();
        var expected_tokens_received = 100 * (1 - swap_fee) * start_state.token_eth_rate;
        var user_tokens1 = await token_contract.connect(provider.getSigner(defaultAccount)).balanceOf(defaultAccount);
        score += check("Testing simple exchange of ETH to token", swap_fee[0], 
          Math.abs((start_state.token_liquidity - expected_tokens_received) - state1.token_liquidity) < 5 &&
          (state1.eth_liquidity - start_state.eth_liquidity) === 100 &&
          Math.abs(Number(start_tokens) + expected_tokens_received - Number(user_tokens1)) < 5);
        
        await swapTokensForETH(100, 1);
        var state2 = await getPoolState();
        var expected_eth_received = 100 * (1 - swap_fee) * state1.eth_token_rate;
        var user_tokens2 = await token_contract.connect(provider.getSigner(defaultAccount)).balanceOf(defaultAccount);
        score += check("Test simple exchange of token to ETH", swap_fee[0], 
          state2.token_liquidity === (state1.token_liquidity + 100) && 
          Math.abs((state1.eth_liquidity - expected_eth_received) - state2.eth_liquidity) < 5 &&
          Number(user_tokens2) === (Number(user_tokens1) - 100));
        
        await addLiquidity(100, 1);
        var expected_tokens_added = 100 * state2.token_eth_rate;
        var state3 = await getPoolState();
        var user_tokens3 = await token_contract.connect(provider.getSigner(defaultAccount)).balanceOf(defaultAccount);
        score += check("Test adding liquidity", swap_fee[0], 
          state3.eth_liquidity === (state2.eth_liquidity + 100) &&
          Math.abs(state3.token_liquidity - (state2.token_liquidity + expected_tokens_added)) < 5 &&
          Math.abs(Number(user_tokens3) - (Number(user_tokens2) - expected_tokens_added)) < 5);
        

        // accumulate some lp rewards
        for (var i = 0; i < 20; i++) {
          await swapETHForTokens(100, 1);
          await swapTokensForETH(100, 1);
        }

        var state4 = await getPoolState();
        var user_tokens4 = await token_contract.connect(provider.getSigner(defaultAccount)).balanceOf(defaultAccount);
        await removeLiquidity(10, 1);
        // set to 22 for a bit of leeway, could potentially reduce to 20 
        var expected_tokens_removed = (10 + 22 * 100 * swap_fee) * state3.token_eth_rate;
        var state5 = await getPoolState();
        var user_tokens5 = await token_contract.connect(provider.getSigner(defaultAccount)).balanceOf(defaultAccount);
        score += check("Test removing liquidity", swap_fee[0], 
          state5.eth_liquidity === (state4.eth_liquidity - 10) &&
          Math.abs(state5.token_liquidity - (state4.token_liquidity - expected_tokens_removed)) < expected_tokens_removed * 1.2 &&
          Math.abs(Number(user_tokens5) - (Number(user_tokens4) + expected_tokens_removed)) < expected_tokens_removed * 1.2);

        await removeAllLiquidity(1);
        expected_tokens_removed = (90 +  22 * 100 * swap_fee) * state5.token_eth_rate;
        var state6 = await getPoolState();
        var user_tokens6 = await token_contract.connect(provider.getSigner(defaultAccount)).balanceOf(defaultAccount);
        score += check("Test removing all liquidity", swap_fee[0], 
          Math.abs(state6.eth_liquidity - (state5.eth_liquidity - 90)) < 5 && 
          Math.abs(state6.token_liquidity - (state5.token_liquidity - expected_tokens_removed)) < expected_tokens_removed * 1.2 &&
          Number(user_tokens6) > Number(user_tokens5)); 
    }
    console.log("Final score: " + score + "/50");

}

// Sleep 3s to ensure init() finishes before sanityCheck() runs on first load.
// If you run into sanityCheck() errors due to init() not finishing, please extend the sleep time.

// setTimeout(function () {
//   sanityCheck();
// }, 3000);