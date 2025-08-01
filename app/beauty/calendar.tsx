import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useState } from 'react';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Calendar, Clock, CreditCard } from 'lucide-react-native';
import { useCart } from '@/contexts/CartContext';

// Génération des dates disponibles (3 semaines à partir d'aujourd'hui)
const generateAvailableDates = () => {
  const dates = [];
  const today = new Date();
  
  for (let i = 1; i <= 21; i++) { // 3 semaines
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    
    // Exclure les dimanches
    if (date.getDay() !== 0) {
      dates.push({
        date: date,
        dateString: date.toLocaleDateString('fr-FR', { 
          weekday: 'long', 
          day: 'numeric', 
          month: 'long' 
        }),
        shortDate: date.toLocaleDateString('fr-FR', { 
          day: '2-digit', 
          month: '2-digit' 
        }),
        dayName: date.toLocaleDateString('fr-FR', { weekday: 'short' })
      });
    }
  }
  
  return dates;
};

// Créneaux horaires disponibles
const availableTimeSlots = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'
];

export default function BeautyCalendarScreen() {
  const { providerId, serviceId, serviceName, serviceEmoji, providerName } = useLocalSearchParams();
  const [selectedDate, setSelectedDate] = useState<any>(null);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const { addToCart } = useCart();

  const availableDates = generateAvailableDates();

  // Prix par service (vous pouvez les adapter selon vos besoins)
  const getServicePrice = (serviceId: string) => {
    const prices: { [key: string]: number } = {
      'coiffure': 100, // points
      'ongles': 65,    // points
      'soins': 80,     // points
      'maquillage': 90 // points
    };
    return prices[serviceId as string] || 75;
  };

  const servicePrice = getServicePrice(serviceId as string);

  const handleBooking = () => {
    if (!selectedDate || !selectedTime) {
      Alert.alert('Sélection incomplète', 'Veuillez choisir une date et un créneau horaire.');
      return;
    }

    // Ajouter au panier avec les informations de réservation détaillées
    const bookingDetails = `${serviceEmoji} Réservation le ${selectedDate.dateString} à ${selectedTime}`;
    
    const bookingId = addToCart({
      productId: serviceId as string,
      productName: `${serviceEmoji} ${serviceName}`,
      productImage: 'https://images.pexels.com/photos/3993456/pexels-photo-3993456.jpeg',
      basePrice: servicePrice,
      quantity: 1,
      customizations: [{
        categoryId: 'booking',
        categoryName: 'Service de beauté',
        selectedOptions: [{
          id: 'datetime',
          name: bookingDetails,
          price: 0
        }]
      }],
      totalPrice: servicePrice,
      providerId: providerId as string,
      providerName: providerName as string || 'Salon de Beauté',
      // Nouvelles informations pour les réservations beauté
      bookingDate: selectedDate.date.toISOString().split('T')[0], // Format YYYY-MM-DD
      bookingTime: selectedTime,
      serviceType: serviceId as string
    });

    Alert.alert(
      'Service ajouté au panier !', 
      `Validez votre panier pour finaliser votre réservation.`,
      [
        {
          text: 'Continuer les achats',
          style: 'cancel',
        },
        {
          text: 'Voir le panier',
          style: 'default',
          onPress: () => {
            router.push('/cart');
          }
        }
      ]
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Choisir une date',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <ArrowLeft size={24} color="#000" />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Résumé de la prestation */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Réservation</Text>
          <Text style={styles.serviceName}>{serviceEmoji} {serviceName}</Text>
          <View style={styles.summaryDetails}>
            <View style={styles.summaryRow}>
              <Clock size={16} color="#8B5CF6" />
              <Text style={styles.summaryText}>Service de beauté professionnel</Text>
            </View>
            <View style={styles.summaryRow}>
              <CreditCard size={16} color="#8B5CF6" />
              <Text style={styles.summaryText}>Prix: {servicePrice} points</Text>
            </View>
          </View>
        </View>

        {/* Sélection de la date */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Choisissez une date</Text>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.datesContainer}>
            {availableDates.map((dateItem, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dateCard,
                  selectedDate?.dateString === dateItem.dateString && styles.selectedDateCard
                ]}
                onPress={() => setSelectedDate(dateItem)}
              >
                <Text style={[
                  styles.dayName,
                  selectedDate?.dateString === dateItem.dateString && styles.selectedDateText
                ]}>
                  {dateItem.dayName}
                </Text>
                <Text style={[
                  styles.dateNumber,
                  selectedDate?.dateString === dateItem.dateString && styles.selectedDateText
                ]}>
                  {dateItem.shortDate}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Sélection de l'heure */}
        {selectedDate && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Choisissez un créneau</Text>
            <Text style={styles.selectedDateDisplay}>
              {selectedDate.dateString}
            </Text>
            
            <View style={styles.timeSlotsContainer}>
              {availableTimeSlots.map((time) => (
                <TouchableOpacity
                  key={time}
                  style={[
                    styles.timeSlot,
                    selectedTime === time && styles.selectedTimeSlot
                  ]}
                  onPress={() => setSelectedTime(time)}
                >
                  <Text style={[
                    styles.timeText,
                    selectedTime === time && styles.selectedTimeText
                  ]}>
                    {time}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Bouton de confirmation */}
        {selectedDate && selectedTime && (
          <View style={styles.bookingSection}>
            <TouchableOpacity style={styles.bookButton} onPress={handleBooking}>
              <Calendar size={20} color="#fff" />
              <Text style={styles.bookButtonText}>Ajouter au panier</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  summaryCard: {
    backgroundColor: '#fff',
    margin: 15,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8B5CF6',
    marginBottom: 10,
  },
  serviceName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 15,
  },
  summaryDetails: {
    gap: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  section: {
    backgroundColor: '#fff',
    margin: 15,
    marginTop: 0,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 15,
  },
  datesContainer: {
    flexDirection: 'row',
  },
  dateCard: {
    backgroundColor: '#F8F4FF',
    borderRadius: 12,
    padding: 15,
    marginRight: 10,
    alignItems: 'center',
    minWidth: 70,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedDateCard: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
  },
  dayName: {
    fontSize: 12,
    color: '#8B5CF6',
    fontWeight: '600',
    marginBottom: 5,
  },
  dateNumber: {
    fontSize: 16,
    color: '#1A1A1A',
    fontWeight: 'bold',
  },
  selectedDateText: {
    color: '#fff',
  },
  selectedDateDisplay: {
    fontSize: 16,
    color: '#8B5CF6',
    fontWeight: '600',
    marginBottom: 15,
    textAlign: 'center',
    backgroundColor: '#F8F4FF',
    padding: 10,
    borderRadius: 8,
  },
  timeSlotsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  timeSlot: {
    backgroundColor: '#F8F4FF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: 'transparent',
    minWidth: 80,
    alignItems: 'center',
  },
  selectedTimeSlot: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
  },
  timeText: {
    fontSize: 14,
    color: '#8B5CF6',
    fontWeight: '600',
  },
  selectedTimeText: {
    color: '#fff',
  },
  bookingSection: {
    padding: 20,
  },
  bookButton: {
    backgroundColor: '#8B5CF6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 10,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
