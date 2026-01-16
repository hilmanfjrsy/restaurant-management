import { initiateEventClient } from "../../config/event";
import { redisClient } from "../../config/redis";
import { CustomersRepository } from "../customers/customers.repository";
import { IReservation, IReservationPagination, ReservationStatus } from "./reservations.interface";
import { ReservationsRepository } from "./reservations.repository";
import { createEventsClient, createEvent, EventsClient } from "@restaurant-management/events";


export class ReservationsService {
  private reservationsRepository: ReservationsRepository;
  private customersRepository: CustomersRepository
  private events: EventsClient
  constructor() {
    this.reservationsRepository = new ReservationsRepository();
    this.customersRepository = new CustomersRepository();
    this.events = {} as EventsClient
  }

  static async create() {
    const service = new ReservationsService();
    await service.initialize();
    return service;
  }

  async initialize() {
    this.events = await initiateEventClient()
  }

  async createReservation(reservation: IReservation) {
    const isCustomerExist = await this.customersRepository.getCustomerById(reservation.customerId);
    if (!isCustomerExist) {
      throw new Error("Customer does not exist");
    }

    const isAvailable = await this.reservationsRepository.checkAvailability(reservation.tableId, reservation.date, reservation.startTime, reservation.endTime);
    if (isAvailable.length > 0) {
      throw new Error("Table is already reserved for the selected time slot");
    }
    const createdReservation = await this.reservationsRepository.createReservation({ ...reservation, status: ReservationStatus.CONFIRMED });
    await this.events.publish(
      createEvent("reservation.confirmed", {
        id: createdReservation[0].id,
        tableId: reservation.tableId,
        customerId: reservation.customerId
      }),
      {
        exchange: "reservation.events",
        routingKey: "reservation.confirmed",
      }
    )
    return createdReservation;
  }

  async getReservationByIds(reservationId: string[]): Promise<Record<string, any>[]> {
    const key = `reservations:${reservationId.join(",")}`
    const cachedReservation = await redisClient.get(key)
    if (cachedReservation) {
      return JSON.parse(cachedReservation)
    }
    const reservations = await this.reservationsRepository.getReservationByIds(reservationId)
    await redisClient.set(key, JSON.stringify(reservations))
    return reservations
  }

  async cancelReservation(reservationId: string[]) {
    const reservations = await this.getReservationByIds(reservationId)
    if (!reservations) {
      throw new Error("Reservation does not exist");
    }

    if (reservationId.length !== reservations.length) {
      throw new Error("Reservation does not exist");
    }

    if (reservations.some(reservation => reservation.status !== ReservationStatus.CONFIRMED)) {
      throw new Error("Reservation is not confirmed");
    }
    for (let index = 0; index < reservations.length; index++) {
      const reservation = reservations[index];
      await this.events.publish(
        createEvent("reservation.cancelled", {
          id: reservation.id,
          tableId: reservation.tableId,
          customerId: reservation.customerId
        }),
        {
          exchange: "reservation.events",
          routingKey: "reservation.cancelled",
        }
      )
    }
    const reservationIds = reservations.map(reservation => reservation.id)
    return await this.reservationsRepository.bulkUpdateReservation(reservationIds, { status: ReservationStatus.CANCELLED })
  }

  async seatReservation(reservationId: string[]) {
    const reservations = await this.getReservationByIds(reservationId)
    if (!reservations) {
      throw new Error("Reservation does not exist");
    }

    if (reservationId.length !== reservations.length) {
      throw new Error("Reservation does not exist");
    }

    if (reservations.some(reservation => reservation.status !== ReservationStatus.CONFIRMED)) {
      throw new Error("Reservation is not confirmed");
    }
    for (let index = 0; index < reservations.length; index++) {
      const reservation = reservations[index];
      await this.events.publish(
        createEvent("reservation.completed", {
          id: reservation.id,
          tableId: reservation.tableId,
          customerId: reservation.customerId
        }),
        {
          exchange: "reservation.events",
          routingKey: "reservation.completed",
        }
      )
    }
    const reservationIds = reservations.map(reservation => reservation.id)
    return await this.reservationsRepository.bulkUpdateReservation(reservationIds, { status: ReservationStatus.COMPLETED })
  }
}