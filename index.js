const Discord = require('discord.js'); 
const bot = new Discord.Client(); 
let request = require('request'); 
const axios = require('axios').default;
const electricCar = require('./variables');
require('dotenv').config();

 

const car = new electricCar.EV();
let ob = {};        
const PREFIX = '!';

var timeArr = [];
var recordChargeTime = []; 
var rangeArr = [];
var coordsArray = []; 
var userMessages = []; 
var apiArray = [];
var asTheCrowFlies = []; 
var stops = []; 
var polyArray = [];

var city; 
var state; 
var beginCity; 
var beginState;
var originLati; 
var originLong; 
var destinationLati;
var destinationLong; 
var latitudeDifference; 
var longitudeDifference;
var lat; 
var long;
var range;
var roadTripper; 
var carChoice;
var address;
var town;
var title;
var st;
var stopAtStation;
var postfix;
var y;

var northToSouth = 0;
var westToEast = 0;
var newTrip = 0;
var counter = 0;

//Function used to buy some time to allow the URLs to properly populate with query parameters. May remove if further testing determines this is not needed. 
function myFunc(){
     return;
}

//getChargeTime function makes an approximation of the time needed to charge the EV during the trip, based on the model of car. 
function getChargeTime(){  
  var distToUse = recordChargeTime[0];
  var worstRate; //A slower rate for charging at level 1 stations. 
  var bestRate; //Fastest rate the vehicle may be able to charge at. 
  if(carChoice==10)
  {    
    bestRate = 3.33;
    worstRate = 0.454;    
  }
  else if(carChoice==11)
  {
    bestRate = 10; 
    worstRate = 0.5;
  }
  else if(carChoice==12)
  {
    bestRate = 6.1;
    worstRate = 0.5;
  }
  else
  {
    bestRate = 15.0;
    worstRate = 0.416;    
  }  
  timeArr.push(distToUse/bestRate);
  timeArr.push(distToUse/worstRate);
  return;
}

//Distance function will take parameters of the latitude and longitude of 2 points and return the distance between those points. 
function distance(lat1, lon1, lat2, lon2) {
  var radlat1 = Math.PI * lat1/180;
  var radlat2 = Math.PI * lat2/180;
  var radlon1 = Math.PI * lon1/180;
  var radlon2 = Math.PI * lon2/180;
  var theta = lon1-lon2;
  var radtheta = Math.PI * theta/180;
  var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
  dist = Math.acos(dist);
  dist = dist * 180/Math.PI;
  dist = dist * 60 * 1.1515;
  return dist;
}


//The method on turns the bot on and outputs a message that it's online to the console. 
bot.on('ready', () =>{
    console.log('Bot is online!'); 
});


bot.on('message', message=>{ //On method listens for when message event is fired, this is when a user types anything in the channel.
    let args = message.content.substring(PREFIX.length).split(" ");//Breaking up user input into an array whose elements are words
    // delimited by spaces. 
    if(!message.content.includes(PREFIX)&&(message.author.id===roadTripper)){ //If the message doesn't include the command prefix, and is sent by anyone
    //who used the !roadTrip command.
         counter++;//Using counter to count number of replies from user. It's a way to implement logic for how the bot should reply and what input to expect from
         //the user based on their answer to the bot's output. 
         if(counter==1) 
         {  
           let inputStr = message.content.split(',');  
           userMessages.push(inputStr[0].trim()); 
           userMessages.push(inputStr[1].trim());         
           message.reply("What is the origin city and state? \
           \nPlease format: (City, 2 letter state abbreviation) Example: Chicago, IL");  
         }

         if(counter==2)
         {  
           let inputStr2 = message.content.split(',');   
           userMessages.push(inputStr2[0].trim()); 
           userMessages.push(inputStr2[1].trim());   
           //A menu for user to select which vehicle they will be taking on the trip.          
           message.reply("What electric vehicle will you be taking on your road trip?\
           \n 1. Tesla Model X Performance\
           \n 2. Tesla Model X Long Range Plus\
           \n 3. Tesla Model 3 Performance or Long Range\
           \n 4. Tesla Model 3 Standard Plus\
           \n 5. Tesla Model S Performance\
           \n 6. Tesla Model S Long Range Plus\
           \n 7. Tesla Model S Plaid\
           \n 8. Tesla Model Y Long Range\
           \n 9. Tesla Model Y Performance\
           \n 10. Chevrolet Bolt\
           \n 11. GMC Hummer EV\
           \n 12. Ford Mustang Mach-E");            
         }
                   
         if(counter==3)
         { 
          carChoice = message.content;  
          if(isNaN(carChoice))  
          {
            message.reply("Please enter a number between 1 and 11 only, omitting all non-Numeric characters.");
            counter--;           
          }
          if(counter==3) 
          {
          switch(carChoice)//The switch statement sets the variable range to the appropriate value based on user's input.
          {  
            case '1':
              range = car.teslaXPerform;
              rangeArr.push(car.teslaXPerform);
              break;
            case '2':
              range = car.teslaXLRP;
              rangeArr.push(car.teslaXLRP);
              break;
            case '3':
              range = car.tesla3PerformorLongRange;
              rangeArr.push(car.tesla3PerformorLongRange);
              break;
            case '4':
              range = car.tesla3SP;
              rangeArr.push(car.tesla3SP);
              break;
            case '5':
              range =  car.teslaSPerform;
              rangeArr.push(car.teslaSPerform);
              break;
            case '6':
              range = car.teslaSLRP;
              rangeArr.push(car.teslaSLRP);
              break;
            case '7':
              range = car.teslaSPlaid;
              rangeArr.push(car.teslaSPlaid);
              break;
            case '8':
              range = car.teslaYLR;
              rangeArr.push(car.teslaYLR);
              break;
              case '9':
              range = car.teslaYPerform;
              rangeArr.push(car.teslaYPerform);
              break;
              case '10':
              range = car.bolt;
              rangeArr.push(car.bolt);
              break;
              case '11':
              range = car.hummer;
              rangeArr.push(car.hummer);
              break;
              case '12':
              range = car.mustangMachE;
              rangeArr.push(car.mustangMachE);
              break;
            default:  //Default case for any input that isn't a number between 1 and 8. 
             message.reply("You didn't select a valid number.");
             break;
          }
        }
          if(counter==2) //If the counter was decremented because the user entered input that wasn't a number, present menu to user again
          {
            message.reply("What electric vehicle will you be taking on your road trip?\
            \n 1. Tesla Model X Performance\
            \n 2. Tesla Model X Long Range Plus\
            \n 3. Tesla Model 3 Performance or Long Range\
            \n 4. Tesla Model 3 Standard Plus\
            \n 5. Tesla Model S Performance\
            \n 6. Tesla Model S Long Range Plus\
            \n 7. Tesla Model S Plaid\
            \n 8. Tesla Model Y Long Range\
            \n 9. Tesla Model Y Performance\
            \n 10. Chevrolet Bolt\
            \n 11. GMC Hummer EV\
            \n 12. Ford Mustang Mach-E");
          }

          else  
          {
            message.reply("What will be the % charge of your battery when you start your trip?");
          }
        }
          
        
        if(counter==4){ 
           let chargeLevel = message.content;   
           if(isNaN(chargeLevel)||chargeLevel<=0||chargeLevel>100) //Check if user entered a correct value. 
           {
             message.reply("Please enter a numerical value only between 1 and 100");
             counter--; //Decrement counter if user entered incorrect input. 
           }
           if(counter==3) //If user entered incorrect input, ask them again. 
           {
            message.reply("What will be the % charge of your battery when you start your trip?");
           }
           if(chargeLevel>30&&chargeLevel<101) //If the charge level is between 31 and 100.
           {
             chargeLevel = chargeLevel/100; //Divide charge level by 100 to get a decimal equivalent. 
             range = (range * chargeLevel) - 20;//Determine the range (distance they can travel based on battery level) and subtract 20 miles as a buffer.  
           }
           else if(chargeLevel>1&&chargeLevel<=30) //If the charge level is too low, let user know they need to charge and exit program. 
           {
             message.reply("It's recommended you charge locally before you begin your trip.");
             return;
           }          
         }
         //This checks if the user replied that they did NOT want to recalculate a trip because no level 3 chargers were found on their route. 
         if((counter>=5&&message.content==='N')||(counter>=5&&message.content==='n'))
         {
           return;
         }
        //Putting second element of the array into state variable, and trimming whitespace. 
         //LocationURL is variable which holds the API call to google maps, getting the latitude and longitude of the city and
         //state they entered as input. These are passed into the URL as variables with the ${} syntax. 
         if(counter>3){ 
          beginCity = userMessages[2];  
          beginState = userMessages[3];  
         let LocationURL2 = `https://maps.googleapis.com/maps/api/geocode/json?address=${beginCity},+${beginState}&key=${process.env.GEOCODE_KEY}`; //Plugging in variables beginCity and beginState to the URL used in api call
        request(LocationURL2, function (err, response, body) {               
         if(err){ 
           console.log('error:', error);  
           message.reply("Looks like there was a problem getting the data for that location."); 
         } 
         else 
         { 
           let roadTrip2 = JSON.parse(body);   
           let result1 = roadTrip2.results[0].geometry.location.lat; 
           let result2 = roadTrip2.results[0].geometry.location.lng; 
           apiArray[0] = result1;  
           apiArray[1] = result2; 
           city = userMessages[0]; 
           state = userMessages[1]; 
           let LocationURL = `https://maps.googleapis.com/maps/api/geocode/json?address=${city},+${state}&key=${process.env.GEOCODE_KEY}`; //Plugging in variables city and state (representing destination) to set the destination location URL. 
         request(LocationURL, function (err, response, body) {               
           if(err){ 
             console.log('error:', error);  
             message.reply("Looks like there was a problem getting the data for that location."); 
           } 
           else { 
             let roadTrip = JSON.parse(body);  
             destinationLati = roadTrip.results[0].geometry.location.lat; 
             destinationLong = roadTrip.results[0].geometry.location.lng;             
             originLati = apiArray[0]; 
             originLong = apiArray[1];  
             if(originLati>destinationLati) //A trip will be primarily north/south oriented if the origin latitude is greater than the destination latitude.
             {
               northToSouth = 1; //set this variable to true if trip is north/south oriented.                
             }
             if(originLong>destinationLong) //A trip will be primarily east/west oriented if the origin longitude is greater than destination longitude. 
             {
               westToEast = 1; //set this variable to true if trip is east/west oriented.                 
             }
             
             longitudeDifference = Math.abs(destinationLong-originLong); //Determine the difference in longitude between origin and destination.
             latitudeDifference = Math.abs(destinationLati-originLati); //Determine the difference in latitude between origin and destination. 
             let directionsURL = `https://maps.googleapis.com/maps/api/directions/json?origin=${originLati},${originLong}&destination=${destinationLati},${destinationLong}&units=imperial&key=${process.env.DIRECTIONS_KEY}`; //Setting URL to be used in google directions api with values of destination and origin coordinates. 
              request(directionsURL, function (err, response, body) {              
                if(err){ 
                   console.log('error:', error); 
                 } 
                else { 
                   let w = JSON.parse(body); //Parse the JSON data
                   let poly = w.routes[0].overview_polyline.points; //Getting the encoded value for the polyline (polyline is a series of points along a route)
                   polyArray[0]=poly;  
                   let tripDistance = w.routes[0].legs[0].distance.text; 
                   var TDSplit = tripDistance.split(' '); 
                   var tripDistance1 = TDSplit[0]; 
                   message.reply("Looks like that trip is " + tripDistance1 + " miles."); 
                   var newTrip = tripDistance1.replace(",", "");//Removing the , from the string returned by Google directions api, so it can be used as a number in calculations. 
                   recordChargeTime[0] = newTrip - range;
                   if(tripDistance1<range) //Determine if they can make the trip without stopping to charge. 
                   {
                     message.reply("You can reach your destination without charging!"); 
                     return;
                   }
                   setTimeout(myFunc, 2000);   //Giving time for chargeURL to populate with data, might not be necessary.               
                   let chargeURL1 = `https://api.openchargemap.io/v3/poi/?output=json&polyline=${poly}&maxresults=100&levelid=3&distance=5&compact=true&verbose=false`; //URL to be used in open charge map api call, populated with a polyline returned from google directions. 
                   setTimeout(myFunc, 1000);
                   if(counter>=5&&message.content=='Y') //Checking if a trip the user wants to go on didn't have any level 3 charging stations, then remove the levelid query param from URL and use that in the request function.
                   {
                     chargeURL1 = `https://api.openchargemap.io/v3/poi/?output=json&polyline=${poly}&maxresults=100&distance=5&compact=true&verbose=false`; //See explanation above.
                   }                    
            request(chargeURL1, function (err, response, body) {               
            if(err){ 
               console.log('error:', error); 
             } 
            else { 
               let chargingStations = JSON.parse(body); 
               let numStations = Object.keys(chargingStations).length; //Get the number of charging stations returned in the JSON array from the api call. 
               
               if(numStations==0&&message.content!='Y'){//If there are no level 3 stations along route, inform user. 
                 message.reply("Looks like there are no level 3 charging stations along your route,\
                 \n however I can search that route again for level 2 and level 1 stations. Would you like to do that?\
                 \n Enter 'Y' or 'N'");
               }
               else if(numStations==0&&message.content=='Y')//If level 3, 2, or 1 stations weren't found. 
               {
                 message.reply("It doesn't look like this trip is possible in an electric vehicle");
                 return;
               }
               else{ //If level 3 stations were found. 
                 message.reply("There are " + numStations + " charging stations along your route.");    
               for(var i = 0; i < numStations; i++) 
               { 
                  var obj = chargingStations[i]; 
                  lat = obj.AddressInfo.Latitude; 
                  long = obj.AddressInfo.Longitude; 
                  address = obj.AddressInfo.AddressLine1; 
                  town = obj.AddressInfo.Town; 
                  title = obj.AddressInfo.Title;
                  st = obj.AddressInfo.StateOrProvince;
                  if((title.includes("Tesla")||title.includes("Supercharger"))&&(carChoice==10||carChoice==11||carChoice==12))
                  continue;  
                  var coords = new Object(); 
                  coords.latitude = lat; 
                  coords.longitude = long; 
                  coords.stationAddress = address; 
                  coords.stationTown = town;  
                  coords.stationState = st;  
                  coordsArray.push(coords); 
              }
        
        
              if(latitudeDifference>longitudeDifference){ //Checking if the difference in latitude is greater than the difference in longitude
              coordsArray.sort((a,b) => (a.latitude > b.latitude) ? 1 : -1); //If it is, then sort the coordsArray by latitude only. 
              if(northToSouth===1) //If the trip is north south oriented
              {
                coordsArray.reverse(); //Reverse the coordsArray so it's elements sync with asTheCrowFlies array
              }
              }
              else
              {
               coordsArray.sort((a,b) => (a.longitude > b.longitude) ? 1 : -1);//If the difference in latitude is less than the difference in longitude, sort by longitude.
               if(westToEast===1)
               {
                 coordsArray.reverse(); //Reverse the coordsArray if it's an east west trip.                  
               }
              }
              var la = apiArray[0]; 
              var lo = apiArray[1]; 
              var arrLength = coordsArray.length; 
              for(var c = 0;c<arrLength;c++)
              {
                asTheCrowFlies.push(distance(la,lo,coordsArray[c].latitude,coordsArray[c].longitude)); //Calculate the distance between the origin and a charging station using the distance function. 
              }                            
              
              if(arrLength==2&&asTheCrowFlies[1]<range&&tripDistance1-asTheCrowFlies[1]<rangeArr[0])
              {
                stops.push(1);                 
              }
              if(arrLength>2)
              {
               
               for(var i = 0;i<arrLength-1;i++)//Checking each value in the asTheCrowFlies array. asTheCrowFlies will have the same number of elements as
               //coordsArray and the value of arrLength is equal to the lenght of coordsArray.                
               { 
                 if((asTheCrowFlies[i+1]-asTheCrowFlies[i])>(range + 20))
                 {
                   message.reply("Unfortunately this trip isn't possible with your model of electric vehicle.");
                   return;
                 }               
                 if(asTheCrowFlies[i+1]>range && asTheCrowFlies[i]<range)//If the next element in the asTheCrowFlies array is greater than the current range 
                 //of the car, and the current element is less than the current range, store that value of i in the stops array. 
                 {
                   stops.push(i); //Populate the stops array with value of i, representing what charging station user will need to stop at to charge.
                   la = coordsArray[i].latitude; 
                   lo = coordsArray[i].longitude;                   
                   for(var j = i+1;j<arrLength;j++) 
                   {
                     asTheCrowFlies[j] = distance(la,lo,coordsArray[j].latitude,coordsArray[j].longitude); //Put the result from calling the distance function to determine the distance from the origin to each charging station.
                   }
                   
                   range = rangeArr[0] * 0.9;                  
                 }                
                 else
                 {
                   continue;
                 }
                }
        
               }
             }
            
             
             getChargeTime();
             
               
              let stopsLen = stops.length;  
              let stopCheck = stops[stopsLen - 1];
              var distCheck = distance(destinationLati, destinationLong, coordsArray[stopCheck].latitude, coordsArray[stopCheck].longitude);
              if(distCheck>rangeArr[0])
              {
                message.reply("Looks like this journey isn't possible on the route suggested by google maps.\
                \nYou may be able to reach your destination by altering your route or searching for level 1 charging stations.");
                return;
              }
        
              if(stopsLen!=0) //If the stops array has values
              {
               message.reply("You need to stop at "+ stopsLen + " electric vehicle charging stations.");  //Let user know how many stations they need to stop at. 
               message.reply("For this model of electric vehicle, the best case time spent charging during the trip is: " + timeArr[0].toFixed(1) + " minutes. \
               \nThe worst case would be: " + timeArr[1].toFixed(1) + " minutes. \
               \n DISCLAIMER! The best case and worst case are highly unlikely. Charge times will likely skew towards the best-case value. \
               \nFor multi-day trips, charging overnight at destination chargers could significantly reduce the wait time.");           
              for(var f = 0;f<stopsLen;f++)//For every index in the stops array
              {
                stopAtStation = stops[f]; //Get the value for that index. 
                if(f==0)//The following are setting the proper postfix for the station stop number. 
                {
                  postfix = 'st';
                }
                else if(f==1)
                {
                  postfix = 'nd';
                }
                else if(f==2)
                {
                  postfix = 'rd';
                }
                else
                {
                  postfix = 'th';
                }
                y = f+1; //Y is one more than the current element of the for loop, only for displaying the stop number (1st stop, 2nd stop, 3rd stop) to user. 
                message.channel.send("Your " + y + postfix + " stop will be at: "); //Stop number
                message.channel.send(coordsArray[stopAtStation].stationAddress); //Output the address of charging station
                message.channel.send(coordsArray[stopAtStation].stationTown + ", " + coordsArray[stopAtStation].stationState); //Output the town and state of charging station. 
              }
             }
           }           
        });      
      }
    });       
        }
        });                   
             }  
            });          
        }
      }    
   
  
       
    //Switch statement for when a user enters a commandd in the channel using the ! prefix.  
    switch(args[0]){        
        
           
         case 'roadTrip': 
             message.reply('Hi! I want to squash the myth that you can\'t go anywhere in an electric vehicle!\
             \n You\'ll see there are plenty of places you can charge your EV for pretty much any trip you want to take.\
             \nWhat is the destination city and state?\
             \n Please format: (City, 2 letter state abbreviation) Example: Chicago, IL'); //Get user location input for their trip.
             newTrip++; //newTrip will increment when user uses !roadTrip command.
             if(newTrip>1)// This checks if a user who has already used the roadTrip command in the same session and uses it again for a new trip, it 
             //will reset all the variables used in the initial trip. 
             {
               counter = 0;
               apiArray = [];
               userMessages = [];
               asTheCrowFlies = [];
               polyArray = [];
               coordsArray = [];
               stops = [];
               westToEast = 0;
               northToSouth = 0;
               rangeArr = [];
               timeArr = [];
             }
             roadTripper = message.author.id; //Getting the unique id of the discord user that used the roadTrip command. 
            break; 
         case 'Help': 
           message.reply('Welcome! EVChargeBot will assist you with planning a road trip\
           \n in an electric vehicle that is fully within the continental United States. \
           \n The bot\'s default search parameters include only the fastest \
           \n charging stations, known as level 3 stations. The bot will provide the option to search for \
           \n stations at which it will take longer to charge if it doesn\'t find any level 3 stations \
           \n on your route. The bot will display the address of the level 3 charging stations you need to stop at\
           \n in order to reach your destination. It will also display the trip mileage and the number of \
           \n charging stations. To begin, use the command !roadTrip and follow the prompts, noting the format \
           \n the bot is requesting you use for your input.');
           break;         
    }  
  });
  


bot.login(process.env.BOT_TOKEN); //Process to log the bot in to the channel. 