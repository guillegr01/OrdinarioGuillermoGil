import { OptionalId } from "mongodb";

export type RestaurantModel = OptionalId<{
    name: string,
    address: string,
    city: string,
    phone: string,
    country: string,
    timezone: string
}>;

export type APIPhone = {
    is_valid: boolean,
    country: string,
    timezones: string[]
}

export type APITime = {
    hour: string,
    minute: string
}

export type APICity = {
    latitude: number,
    longitude: number
}

export type APIWeather = {
    temp: number
}