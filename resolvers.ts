import { Collection } from "mongodb";
import { RestaurantModel, APIPhone, APITime, APIWeather, APICity } from "./types.ts";
import { GraphQLError } from "graphql";
import { ObjectId } from "mongodb";


export const resolvers = {

    Restaurant: {
        id: (root:RestaurantModel): string => {
            return root._id!.toString();
        },
        actualHour: async (root: RestaurantModel): Promise<string> => {

            const API_KEY = Deno.env.get("API_KEY");
            if(!API_KEY) throw new GraphQLError("Please enter a valid API_KEY");

            const url = `https://api.api-ninjas.com/v1/worldtime?timezone=${root.timezone}`;
            const data = await fetch(url, {
                headers: {
                    "X-Api-Key": API_KEY
                }
            });

            if(data.status!==200) throw new GraphQLError("API_KEY ERROR");

            const response: APITime = await data.json();
            const hour = response.hour;
            const minute = response.minute;

            return `${hour}:${minute}`;
        },

        temperature: async (root: RestaurantModel): Promise<number> => {

            const API_KEY = Deno.env.get("API_KEY");
            if(!API_KEY) throw new GraphQLError("Please enter a valid API_KEY");

            const urlCity = `https://api.api-ninjas.com/v1/city?country=${root.country}`;
            const dataCity = await fetch(urlCity, {
                headers: {
                    "X-Api-Key": API_KEY
                }
            });

            if(dataCity.status!==200) throw new GraphQLError("API_KEY ERROR");

            const responseCity: APICity = await dataCity.json();
            const latitude = responseCity.latitude;
            const longitude = responseCity.longitude;
            
            const urlWeather = `https://api.api-ninjas.com/v1/weather?lat=${latitude}&lon=${longitude}`;
            const dataWeather = await fetch(urlWeather, {
                headers: {
                    "X-Api-Key": API_KEY
                }
            });

            if(dataWeather.status!==200) throw new GraphQLError("API_KEY ERROR");

            const responseWeather: APIWeather = await dataWeather.json();

            return responseWeather.temp;
        }
    },

    Query: {
        getRestaurants: async (_root:unknown, _args:unknown, context:{rc:Collection<RestaurantModel>}): Promise<RestaurantModel[]> => {

            const restaurantsDB = await context.rc.find().toArray();

            if(restaurantsDB.length===0) throw new GraphQLError("The Restaurant collection from the DDBB is empty.");

            return restaurantsDB;
        },

        getRestaurant: async (_root:unknown, args: {id:string}, context: {rc:Collection<RestaurantModel>}): Promise<RestaurantModel|null> => {

            const restaurantDB = await context.rc.findOne({_id: new ObjectId(args.id as string)});
            if(!restaurantDB) throw new GraphQLError("There is no restaurant with the specified ID in the DDBB");

            return restaurantDB;
        }
    },

    Mutation: {
        addRestaurant: async (_root:unknown,args:{name:string,address:string,city:string,phone:string},context:{rc:Collection<RestaurantModel>}): Promise<RestaurantModel> => {

            const API_KEY = Deno.env.get("API_KEY");
            if(!API_KEY) throw new GraphQLError("Please enter a valid API_KEY");

            const {name,address,city,phone} = args;

            if(!name || !address || !city || !phone) throw new GraphQLError("Theese parameters (name,address,city,phone)are required");

            const phoneExists = await context.rc.countDocuments({phone});
            if(phoneExists>=1) throw new GraphQLError("The phone inserted is already in use by another Restaurant");

            const url = `https://api.api-ninjas.com/v1/validatephone?number=${phone}`;
            const data = await fetch(url, {
                headers: {
                    "X-Api-Key": API_KEY
                }
            });

            if(data.status!==200) throw new GraphQLError("API_KEY ERROR");

            const response: APIPhone = await data.json();
            if(!response.is_valid) throw new GraphQLError("The phone format is not valid");
            const country = response.country;
            const timezone = response.timezones[0];

            const { insertedId } = await context.rc.insertOne({
                name,
                address,
                city,
                phone,
                country,
                timezone
            });

            return {
                _id: insertedId,
                name,
                address,
                city,
                phone,
                country,
                timezone
            }
        },

        deleteRestaurant: async (_root:unknown, args:{id:string},context:{rc:Collection<RestaurantModel>}): Promise<boolean> => {

            if(!args.id) throw new GraphQLError("The parameter ID is required");

            const { deletedCount } = await context.rc.deleteOne({
                _id: new ObjectId(args.id as string)
            });

            if(deletedCount===0) return false;

            return true; 
        }
    }

}