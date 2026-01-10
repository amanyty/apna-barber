import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

export function formatTime(timeString: string): string {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
}

export function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}

export function getStatusColor(status: string): string {
    const colors: Record<string, string> = {
        pending: 'bg-yellow-100 text-yellow-800',
        confirmed: 'bg-blue-100 text-blue-800',
        'in-progress': 'bg-purple-100 text-purple-800',
        completed: 'bg-green-100 text-green-800',
        cancelled: 'bg-red-100 text-red-800',
        'no-show': 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
}

export function getPaymentStatusColor(status: string): string {
    const colors: Record<string, string> = {
        pending: 'bg-orange-100 text-orange-800',
        completed: 'bg-green-100 text-green-800',
        failed: 'bg-red-100 text-red-800',
        refunded: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
}

export function generateTimeSlots(
    openingTime: string = '09:00',
    closingTime: string = '21:00',
    intervalMinutes: number = 30
): string[] {
    const slots: string[] = [];
    const [openHour, openMin] = openingTime.split(':').map(Number);
    const [closeHour, closeMin] = closingTime.split(':').map(Number);

    let currentMinutes = openHour * 60 + openMin;
    const endMinutes = closeHour * 60 + closeMin;

    while (currentMinutes < endMinutes) {
        const hours = Math.floor(currentMinutes / 60);
        const mins = currentMinutes % 60;
        slots.push(`${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`);
        currentMinutes += intervalMinutes;
    }

    return slots;
}

export function isSlotAvailable(
    slot: string,
    bookedSlots: { start_time: string; end_time?: string }[],
    serviceDuration: number = 30
): boolean {
    const slotMinutes = timeToMinutes(slot);
    const slotEnd = slotMinutes + serviceDuration;

    for (const booked of bookedSlots) {
        const bookedStart = timeToMinutes(booked.start_time);
        const bookedEnd = booked.end_time ? timeToMinutes(booked.end_time) : bookedStart + 30;

        if (slotMinutes < bookedEnd && slotEnd > bookedStart) {
            return false;
        }
    }

    return true;
}

function timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
}
