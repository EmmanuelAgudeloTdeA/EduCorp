/**
 * Script para corregir el formato de characteristics en learning_styles
 * Convierte arrays a strings con saltos de línea si es necesario
 */

const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

// Inicializar Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function fixLearningStylesFormat() {
  console.log('🔧 Verificando formato de learning_styles...\n');

  try {
    const learningStylesSnapshot = await db.collection('learning_styles').get();
    
    if (learningStylesSnapshot.empty) {
      console.log('⚠️  No se encontraron estilos de aprendizaje.');
      console.log('💡 Ejecuta: node seed_learning_styles.cjs\n');
      return;
    }

    let updatedCount = 0;
    let correctCount = 0;

    for (const doc of learningStylesSnapshot.docs) {
      const data = doc.data();
      const updates = {};

      // Verificar characteristics
      if (data.characteristics) {
        if (Array.isArray(data.characteristics)) {
          // Convertir array a string con saltos de línea
          updates.characteristics = data.characteristics.join('\n');
          console.log(`📝 ${data.name}: characteristics convertido de array a string`);
          updatedCount++;
        } else if (typeof data.characteristics === 'string') {
          correctCount++;
        }
      }

      // Aplicar actualizaciones si hay cambios
      if (Object.keys(updates).length > 0) {
        updates.updatedAt = new Date().toISOString();
        await db.collection('learning_styles').doc(doc.id).update(updates);
      }
    }

    console.log('\n✅ Verificación completada');
    console.log(`   ✓ ${correctCount} estilos en formato correcto`);
    console.log(`   ✓ ${updatedCount} estilos actualizados\n`);

    if (updatedCount === 0 && correctCount > 0) {
      console.log('💡 Todos los estilos ya estaban en el formato correcto.\n');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit(0);
  }
}

// Ejecutar el script
fixLearningStylesFormat();

