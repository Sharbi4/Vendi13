import React, { useEffect } from 'react';
import { base44 } from '@/api/base44Client';

// Helper to create notifications
export async function createNotification(data) {
  try {
    await base44.entities.Notification.create(data);
  } catch (error) {
    console.error('Failed to create notification:', error);
  }
}

// Helper to notify on new booking
export async function notifyNewBooking(booking, listing, hostEmail) {
  await createNotification({
    user_email: hostEmail,
    type: 'booking_request',
    title: 'New Booking Request',
    message: `${booking.guest_name} requested to book ${listing.title}`,
    reference_id: booking.id,
    link: '/Dashboard',
  });
}

// Helper to notify booking confirmation
export async function notifyBookingConfirmed(booking, listing, guestEmail) {
  await createNotification({
    user_email: guestEmail,
    type: 'booking_confirmed',
    title: 'Booking Confirmed',
    message: `Your booking for ${listing.title} has been confirmed`,
    reference_id: booking.id,
    link: '/MyBookings',
  });
}

// Helper to notify new message
export async function notifyNewMessage(conversation, senderName, recipientEmail) {
  await createNotification({
    user_email: recipientEmail,
    type: 'message',
    title: 'New Message',
    message: `${senderName} sent you a message about ${conversation.listing_title}`,
    reference_id: conversation.id,
    link: '/Dashboard',
  });
}

// Helper to notify new payout
export async function notifyNewPayout(payout, hostEmail, amount) {
  await createNotification({
    user_email: hostEmail,
    type: 'payout',
    title: 'Payout Processed',
    message: `You received a payout of $${amount.toLocaleString()}`,
    reference_id: payout.id,
    link: '/PayoutsPage',
  });
}

export default function BookingConfirmation() {
  return null;
}