App = {
    loading: false,
    contracts: {},  

    load: async () => {
        //load app
        console.log("App is loading")
        await App.loadWeb3()
        await App.loadAccount()
        await App.loadHealthCare()
        await App.render()
    },

    //https://medium.com/metamask/https-medium-com-metamask-breaking-change-injecting-web3-7722797916a8
    loadWeb3: async () => {
        if (typeof web3 !== 'undefined') {
        App.web3Provider = web3.currentProvider
        web3 = new Web3(web3.currentProvider)
        } else {
        window.alert("Please connect to Metamask.")
        }
        // Modern dapp browsers...
        if (window.ethereum) {
        window.web3 = new Web3(ethereum)
        try {
            // Request account access if needed
            await ethereum.enable()
            // Acccounts now exposed
            web3.eth.sendTransaction({/* ... */})
        } catch (error) {
            // User denied account access...
        }
        }
        // Legacy dapp browsers...
        else if (window.web3) {
        App.web3Provider = web3.currentProvider
        window.web3 = new Web3(web3.currentProvider)
        // Acccounts always exposed
        web3.eth.sendTransaction({/* ... */})
        }
        // Non-dapp browsers...
        else {
        console.log('Non-Ethereum browser detected. You should consider trying MetaMask!')
        }
    },

    //load current ether account of user to be able to interact with app
    loadAccount: async () => {
        //set the current blockchain account
        App.account = web3.eth.accounts[0]
        console.log(App.account)
    },

    loadHealthCare: async() => {
        //create a JavaScript version of the smart contract to be able to call functions of the contract
        const healthCare = await $.getJSON('HealthCare.json')
        App.contracts.HealthCare = TruffleContract(healthCare)
        App.contracts.HealthCare.setProvider(App.web3Provider)

        //hydrate the smart contract with values from the blockchain
        App.healthCare = await App.contracts.HealthCare.deployed()
    },

    homePageApp: async () => {
        let accounts = []
        accounts = web3.eth.accounts
        
        //doctor signup function
        $("#doctorSignUp").click(function() {
            const $errorResult = document.getElementById('errorDoctorSignUp')
            const name = $('#doctorUserNameSignUp').val()
            App.healthCare.signupDoctor(name, {from:accounts[0]})
            .then(result => {
                $errorResult.innerHTML = `Account successfully created! Please log in.`
            })
            .catch(_e => {
                console.log(_e)
                $errorResult.innerHTML = `You are already signed up as a doctor! Please log in.`
            })
        })        
        
        //doctor login function
        $("#doctorLogIn").click(function() {
            const $errorResult = document.getElementById('errorDoctorLogIn')
            const name = $('#doctorUserNameLogIn').val()
            App.healthCare.getDoctorInfo({from:accounts[0]})
            .then(result => {
                App.setLoading(true)
                App.doctorApp()
                window.location.href = "http://localhost:3000/doctor.html"
            })
            .catch(_e => {
                console.log(_e)
                $errorResult.innerHTML = `You are not signed up as a doctor! Please sign up.`
            })
        })

        //patient signup function
        $("#patientSignUp").click(function(){
            const $errorResult = document.getElementById('errorPatientSignUp');
            const name= $('#patientUserNameSignUp').val() 
            const age= $('#patientAgeSignUp').val() 
            App.healthCare.signupPatient(name, age, {from:accounts[1]})
            .then(result => {
                $errorResult.innerHTML = `Account successfully created! Please log in.`
            })
            .catch(_e => {
                console.log(_e)
                $errorResult.innerHTML = `You are already signed up as a patient! Please log in.`
            })
        })
    
        //patient login function
        $("#patientLogIn").click(function(){
            const $errorResult = document.getElementById('errorPatientLogIn');
            App.healthCare.getPatientInfo({from:accounts[1]})
            .then(result => {
                window.location.href = "http://localhost:3000/patient.html"
            })
            .catch(_e => {
                console.log(_e)
                $errorResult.innerHTML = `You are not signed up as a patient! Please sign up.`
            })
        })
    },

    doctorApp: async () => {
        let accounts = []
        var i
        console.log('hi')
        web3.eth.accounts
        .then(_accounts => {
            accounts = _accounts
            for (i=1;i<5;i++) {
                if (i!=3) {
                    console.log('hi')
                    var patients='<option value='+accounts[i] +'>Patient '+i+'</option>'
                    $("#patientName").append(patients)
                }
            }

            App.healthCare.getDoctorInfo({from:accounts[0]})
            .then(result => {
                if (result[2].length>0) {
                    console.log(result);
                    // var accepted=$( '<a data-toggle="modal" data-target="#alice" class="list-group-item list-group-item-action active">  ALICE </a>');
                    var accepted=$( '<a  data-toggle="modal" data-target="#alice" class="list-group-item list-group-item-action active">  Patient 1 </a>');
                    $('#acceptedPatientsList').append(accepted);
                }
            })
            .catch(_e => {
                console.log(_e);  
            })  
        })
        
        $("#selectedPatient").click(function() {
            App.healthCare.requestAccess($('#patientName').val(), {from:accounts[0]})
            .then(result => {
                console.log('request sent')
            })
            .catch(_e => {
                console.log(_e)
            // $errorResult.innerHTML = `Ooops... there was an error while trying to connect to blockchain...` 
            })  
        })

        $("#patientData").click(function() {
            const dataPatient=String($("#consultation_date").val())+','+String($("#diagnosis_name").val())+','+String($("#comments").val()) 
            healthcare.methods.addFile(dataPatient).send({from:accounts[0]})
            .then(result => {
                console.log(' Added patient Data')
            })
            .catch(_e => {
                console.log(_e);
                $errorResult.innerHTML = `Ooops... there was an error while trying to connect to blockchain...`
            })
        })
    },
    
    render: async () => {
        //prevent double render
        if (App.loading) {
          return
        }
    
        //update app loading state
        App.setLoading(true)
    
        //render account
        $('#account').html(App.account)

        //check url and initialise patient or doctor
        if (window.location.pathname == "/doctor.html") {
            console.log('Doctor page application loaded!')
            // healthcare = initHealthContract()
            await App.doctorApp()
        }
        else if (window.location.pathname == "/patient.html") {
            console.log('Patient page application loaded!')
            // healthcare = initHealthContract()
            //await App.patientApp()
        }
        else {
            console.log('Home page application loaded!')
            await App.homePageApp()
        }

        //update loading state
        App.setLoading(false)
    },

    setLoading: (boolean) => {
        App.loading = boolean
        const loader = $('#loader')
        const content = $('#content')
        if (boolean) {
          loader.show()
          content.hide()
        } 
        else {
          loader.hide()
          content.show()
        }
    }
}

//running the app
$(() => {
    $(window).load(() => {
      App.load()
    })
  })

// import Web3 from 'web3';
// import Manager from '../build/contracts/Manager.json';
// import HealthCare from '../build/contracts/HealthCare.json';

// let web3;
// let manager;
// let healthcare;

// const initHealthContract = () => {
//   const deploymentKey = Object.keys(HealthCare.networks)[0];
//   return new web3.eth.Contract(
//     HealthCare.abi, 
//     HealthCare
//       .networks[deploymentKey]
//       .address,
//       {gas: '3000000'}
//   );
// };


// const managerApp = () => {
//   const $create = document.getElementById('create');
//   const $createResult = document.getElementById('create-result');
//  // const $createResult = document.getElementById('history');
 
//   let accounts = [];

//   web3.eth.getAccounts()
//   .then(_accounts => {
//     accounts = _accounts;
//   });
 
//   $create.addEventListener('submit', (e) => {
//     console.log(accounts[1]);
//     e.preventDefault();
//    // const name = e.target.elements[0].value;
//     const sup = e.target.elements[0].value;
//     const drug = e.target.elements[1].value;
//     const quant = e.target.elements[2].value;
//     const date_of_pur = e.target.elements[3].value;
//     const date_of_exp = e.target.elements[4].value;
//     console.log(sup+drug+quant+date_of_pur+date_of_exp);
	  
//     const name=String(sup)+','+String(drug)+','+String(quant)+','+String(date_of_pur)+','+String(date_of_exp);
//     console.log(name);
	  
//    function createHistoryCard(names){
//     var ans = names.split(",");
//      var historyList=$(
//       '<div class="col mb-4">'+
//       '<div class="card border-success "style="background-color: #61ff99" >'+
//        ' <div class="card-body">'+
//          ' <h5 class="card-title">Drug Name:'+ans[1]+'</h5>'+
//          ' <h6 class="card-subtitle mb-2 text-muted">Suppliers name:'+ans[0]+'</h6>'+
//           '<ul class="card-text">'+
//              ' <li>DOP:'+ans[3]+'</li>'+
//               '<li>DOE:'+ans[4]+'</li>'+
//               '<li>Quantity:'+ans[2]+'</li>'+
//            ' </ul>'+
//        ' </div> </div> </div>'
//      );
//      $('#history').append(historyList);
//    }


//     manager.methods.create(name).send({from: accounts[2]})
//     .then(result => {
//       createHistoryCard(name);
//       $createResult.innerHTML = `New drug details added successfully to blockchain`;
//     })
//     .catch(_e => {
//       console.log(_e);
//       $createResult.innerHTML = `Ooops... there was an error while trying to add drug details to the blockchain...`;
//     });
//   });
 
 
// };
// const doctorApp = () => {
//   let accounts = [];
//   var i;
//   web3.eth.getAccounts()
//   .then(_accounts => {
//     accounts = _accounts;
//     for(i=1;i<5;i++){
//     if(i!=3){
//       var patients='<option value='+accounts[i] +'>Patient '+i+'</option>';
//       $("#patientName").append(patients)
//     }
//    }
//    healthcare.methods.getDoctorInfo().call({from:accounts[0]})
//    .then(result => {
//      if(result[2].length>0){
//      console.log(result);
//     // var accepted=$( '<a data-toggle="modal" data-target="#alice" class="list-group-item list-group-item-action active">  ALICE </a>');
//     var accepted=$( '<a  data-toggle="modal" data-target="#alice" class="list-group-item list-group-item-action active">  Patient 1 </a>');
//     $('#acceptedPatientsList').append(accepted);
//      }
//    })
//    .catch(_e => {
//      console.log(_e);
    
//    });  
//   });
 
//  $("#selectedPatient").click(function(){
//   healthcare.methods.requestAccess($('#patientName').val()).send({from:accounts[0]})
//   .then(result => {
//     console.log('request sent');
//   })
//   .catch(_e => {
//     console.log(_e);
//    // $errorResult.innerHTML = `Ooops... there was an error while trying to connect to blockchain...`;
//   });    
//  })
//  $("#patientData").click(function(){
//   const dataPatient=String($("#consultation_date").val())+','+String($("#diagnosis_name").val())+','+String($("#comments").val()) ;
//   healthcare.methods.addFile(dataPatient).send({from:accounts[0]})
//   .then(result => {
//     console.log(' Added patient Data');
//   })
//   .catch(_e => {
//     console.log(_e);
//     $errorResult.innerHTML = `Ooops... there was an error while trying to connect to blockchain...`;
//   });    
//  })

 
 
 
// };
// const patientApp = () => {
//   let accounts = [];
//   var flag=0;
//   web3.eth.getAccounts()
//   .then(_accounts => {
//     accounts = _accounts;
//     healthcare.methods.getPatientInfo().call({from:accounts[1]})
//   .then(result => {
//     console.log(result[4]);
    
//     if(result[4].length>0) {
//     var accept=$('<li class="list-group-item d-flex justify-content-between align-items-center" id="list1">'+
//                   " Doctor1"+
//                  '<span class="btn badge badge-primary badge-pill" id="'+result[4][0]+'">Accept</span>'+
//                  '</li>');
//     $('#removeDoc').append(accept);            
//     }
//    if(result[2]!='')
//    {
//      console.log(result[2]);
//      var ans = result[2].split(",");
//      var hello=$(' <div class="card border-success col-sm-6"style="background-color: #61ff99" >'+
//   '  <div class="card-body px-0 mx-0 ">'+
//     '<h5 class="card-title">Consulted Doctor1</h5>'+
//     '<h6 class="card-subtitle mb-2 text-muted">for'+ ans[2]+'</h6>'+
//     '<ul class="card-text">'+
//       ' <li>on '+ans[1]+'</li>'+
//       ' <li>'+ans[3]+'</li>'+
//       ' </ul>'+
//       ' </div>'+
//       '</div>');
//       $('#another').append(hello);   
//  }
   
//     $('#'+result[4][0]).click(function(){
//       healthcare.methods.grantAccessToDoctor().send({from:accounts[1]})
//       .then(result => {
//         console.log("removing");
//         $("#list1").remove();
//         var add = $(' <li class="list-group-item d-flex justify-content-between align-items-center"> Doctor 1 <span class="btn badge badge-danger badge-pill">Deny</span> </li>');
//         $('#denyList').append(add);
//       })
//       .catch(_e => {
//         console.log(_e);
       
//       });  
     
//     })

//   })
//   .catch(_e => {
//     console.log(_e);
   
//   });  
//   });
  
  
// };