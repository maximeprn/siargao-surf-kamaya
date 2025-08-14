import { getWorldTidesData } from './worldtides'
import { getSimpleTideData } from './tide-direct'

// Simulation : avancer de X jours dans le futur
export async function simulateFutureDate(daysInFuture: number = 6): Promise<void> {
  console.log(`\n🕒 === SIMULATION : On fait comme si on était dans ${daysInFuture} jours ===`)
  
  // Calculer la date simulée
  const futureDate = new Date()
  futureDate.setDate(futureDate.getDate() + daysInFuture)
  const futureDateStr = futureDate.toLocaleDateString('en-CA', { timeZone: 'Asia/Manila' })
  
  console.log('📅 Date simulée:', futureDateStr)
  console.log('📅 Date réelle:', new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Manila' }))
  
  // Temporairement modifier la fonction getSimpleTideData pour utiliser la date future
  console.log('\n1️⃣ Test avec getSimpleTideData (utilisé par TideCurve):')
  await testSimpleTideData(futureDateStr)
  
  console.log('\n2️⃣ Test avec getWorldTidesData (utilisé par AI reports):')
  await testWorldTidesData(futureDateStr)
  
  console.log('\n✅ Simulation terminée!')
}

async function testSimpleTideData(targetDate: string): Promise<void> {
  try {
    // Modifier temporairement tide-direct pour utiliser la date cible
    const originalModule = await import('./tide-direct')
    
    // On va directement tester getTideCacheForDate avec la date future
    const { getTideCacheForDate } = await import('./tide-cache')
    
    console.log(`[Simulation] Recherche des données cachées pour: ${targetDate}`)
    const cachedData = await getTideCacheForDate(targetDate)
    
    if (cachedData) {
      console.log('✅ Données trouvées dans le cache:', {
        heights: cachedData.heights.length,
        extremes: cachedData.extremes.length
      })
      
      // Afficher les 3 premiers points horaires
      console.log('📊 Premiers points horaires:')
      cachedData.heights.slice(0, 3).forEach(h => {
        console.log(`   ${h.hour}:00 → ${h.height}m`)
      })
      
      // Afficher les extremes
      console.log('🌊 Extremes:')
      cachedData.extremes.forEach(e => {
        console.log(`   ${e.time} → ${e.height}m (${e.type})`)
      })
    } else {
      console.log('❌ Aucune donnée trouvée dans le cache pour cette date')
      console.log('🔄 Cela devrait déclencher un bulk fetch...')
    }
  } catch (error) {
    console.error('❌ Erreur lors du test SimpleTideData:', error)
  }
}

async function testWorldTidesData(targetDate: string): Promise<void> {
  try {
    // Pour simuler, on va directement tester shouldDoBulkFetch avec la date simulée
    const { shouldDoBulkFetch } = await import('./tide-cache-optimized')
    
    console.log(`[Simulation] Vérification du besoin de bulk fetch pour la date simulée: ${targetDate}`)
    const bulkCheck = await shouldDoBulkFetch(targetDate)
    
    console.log('📋 Résultat de shouldDoBulkFetch (avec date simulée):')
    console.log(`   Should fetch: ${bulkCheck.shouldFetch}`)
    console.log(`   Reason: ${bulkCheck.reason}`)
    if (bulkCheck.shouldFetch) {
      console.log(`   Start date: ${bulkCheck.startDate}`)
      console.log(`   End date: ${bulkCheck.endDate}`)
      console.log('🚀 Un bulk fetch serait déclenché maintenant!')
      console.log(`   ➡️  Cela fetcherait 7 jours: ${bulkCheck.startDate} à ${bulkCheck.endDate}`)
    }
    
    // Simuler un appel à getWorldTidesData sans vraiment faire l'API call
    console.log('\n[Simulation] Test getWorldTidesData...')
    console.log('⚠️  Pour des raisons de coût, on ne fait pas le vrai appel API')
    console.log('💡 Mais voici ce qui se passerait:')
    
    if (bulkCheck.shouldFetch) {
      console.log('1. Bulk fetch de 7 jours depuis WorldTides API')
      console.log('2. Organisation des données par date')
      console.log('3. Remplacement des données dans Supabase')
      console.log('4. Log du bulk fetch dans tide_fetch_log')
      console.log('5. Retour des données pour la date demandée')
    } else {
      console.log('1. Utilisation des données cachées existantes')
      console.log('2. Conversion au format attendu')
      console.log('3. Retour immédiat des données')
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du test WorldTidesData:', error)
  }
}

// Test spécifique pour voir l'état actuel du cache
export async function inspectCurrentCache(): Promise<void> {
  console.log('\n🔍 === INSPECTION DU CACHE ACTUEL ===')
  
  const today = new Date()
  for (let i = -2; i <= 7; i++) {
    const testDate = new Date(today)
    testDate.setDate(testDate.getDate() + i)
    const dateStr = testDate.toLocaleDateString('en-CA', { timeZone: 'Asia/Manila' })
    
    const { getTideCacheForDate } = await import('./tide-cache')
    const cachedData = await getTideCacheForDate(dateStr)
    
    const status = cachedData ? 
      `✅ ${cachedData.heights.length}h + ${cachedData.extremes.length}e` : 
      '❌ Vide'
    
    const dayLabel = i === 0 ? '(AUJOURD\'HUI)' : 
                     i === 1 ? '(DEMAIN)' : 
                     i > 0 ? `(J+${i})` : `(J${i})`
    
    console.log(`${dateStr} ${dayLabel}: ${status}`)
  }
  
  // Vérifier le log des bulk fetches
  console.log('\n📋 Historique des bulk fetches:')
  try {
    const { supabase } = await import('./supabase')
    if (supabase) {
      const { data: logs } = await supabase
        .from('tide_fetch_log')
        .select('*')
        .order('fetch_date', { ascending: false })
        .limit(5)
      
      if (logs && logs.length > 0) {
        logs.forEach(log => {
          console.log(`   ${log.fetch_date}: ${log.start_date} → ${log.end_date} (${log.days_fetched} jours)`)
        })
      } else {
        console.log('   Aucun bulk fetch enregistré')
      }
    }
  } catch (error) {
    console.log('   ❌ Erreur lors de la lecture des logs:', error)
  }
}