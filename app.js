import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StatusBar,
  FlatList,
  Alert,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

// Sample data structure for products
const SAMPLE_PRODUCTS = [
  {
    id: '1',
    name: 'Organic Cotton T-Shirt',
    category: 'Clothing',
    price: 29.99,
    ecoScore: 92,
    materials: ['Organic Cotton', 'Natural Dyes'],
    image: 'https://via.placeholder.com/150x150/4CAF50/white?text=ECO',
    reviews: 4.8,
    reviewCount: 156,
    sustainabilityFeatures: ['Biodegradable', 'Fair Trade', 'Low Water Usage'],
  },
  {
    id: '2',
    name: 'Bamboo Phone Case',
    category: 'Electronics',
    price: 24.99,
    ecoScore: 88,
    materials: ['Bamboo Fiber', 'Plant-based TPU'],
    image: 'https://via.placeholder.com/150x150/8BC34A/white?text=ECO',
    reviews: 4.6,
    reviewCount: 89,
    sustainabilityFeatures: ['Compostable', 'Renewable Resource', 'Carbon Neutral'],
  },
  {
    id: '3',
    name: 'Recycled Aluminum Water Bottle',
    category: 'Home & Garden',
    price: 34.99,
    ecoScore: 95,
    materials: ['Recycled Aluminum', 'Silicone Seal'],
    image: 'https://via.placeholder.com/150x150/2E7D32/white?text=ECO',
    reviews: 4.9,
    reviewCount: 203,
    sustainabilityFeatures: ['100% Recycled', 'Reusable', 'BPA Free'],
  },
];

const CATEGORIES = [
  { id: 'all', name: 'All Products', icon: '🌱' },
  { id: 'clothing', name: 'Clothing', icon: '👕' },
  { id: 'electronics', name: 'Electronics', icon: '📱' },
  { id: 'home', name: 'Home & Garden', icon: '🏠' },
  { id: 'beauty', name: 'Beauty', icon: '🧴' },
];

// AI Service placeholder - ready for integration
class AIService {
  static async analyzeProductEcoScore(productData) {
    // Placeholder for AI model integration
    // This would connect to your DistilBERT and Random Forest models
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          ecoScore: Math.floor(Math.random() * 30) + 70,
          sentiment: 'positive',
          sustainabilityInsights: [
            'Eco-friendly materials detected',
            'Positive customer feedback on sustainability',
            'Low environmental impact'
          ]
        });
      }, 1000);
    });
  }

  static async searchProducts(query, filters = {}) {
    // Placeholder for AI-powered search
    return new Promise((resolve) => {
      setTimeout(() => {
        const filtered = SAMPLE_PRODUCTS.filter(product => 
          product.name.toLowerCase().includes(query.toLowerCase()) ||
          product.category.toLowerCase().includes(query.toLowerCase())
        );
        resolve(filtered);
      }, 500);
    });
  }
}

// Eco Score Component
const EcoScoreIndicator = ({ score }) => {
  const getScoreColor = (score) => {
    if (score >= 90) return '#2E7D32';
    if (score >= 70) return '#4CAF50';
    if (score >= 50) return '#8BC34A';
    return '#FFC107';
  };

  const getScoreLabel = (score) => {
    if (score >= 90) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 50) return 'Fair';
    return 'Needs Improvement';
  };

  return (
    <View style={styles.ecoScoreContainer}>
      <View style={[styles.ecoScoreCircle, { borderColor: getScoreColor(score) }]}>
        <Text style={[styles.ecoScoreNumber, { color: getScoreColor(score) }]}>
          {score}
        </Text>
      </View>
      <Text style={[styles.ecoScoreLabel, { color: getScoreColor(score) }]}>
        {getScoreLabel(score)}
      </Text>
    </View>
  );
};

// Product Card Component
const ProductCard = ({ product, onPress }) => (
  <TouchableOpacity style={styles.productCard} onPress={() => onPress(product)}>
    <View style={styles.productImageContainer}>
      <View style={styles.productImagePlaceholder}>
        <Text style={styles.productImageText}>🌿</Text>
      </View>
      <View style={styles.ecoScoreBadge}>
        <Text style={styles.ecoScoreBadgeText}>{product.ecoScore}</Text>
      </View>
    </View>
    
    <View style={styles.productInfo}>
      <Text style={styles.productName} numberOfLines={2}>
        {product.name}
      </Text>
      <Text style={styles.productCategory}>{product.category}</Text>
      <Text style={styles.productPrice}>${product.price}</Text>
      
      <View style={styles.productRating}>
        <Text style={styles.ratingText}>⭐ {product.reviews}</Text>
        <Text style={styles.reviewCount}>({product.reviewCount})</Text>
      </View>
      
      <View style={styles.sustainabilityTags}>
        {product.sustainabilityFeatures.slice(0, 2).map((feature, index) => (
          <View key={index} style={styles.sustainabilityTag}>
            <Text style={styles.sustainabilityTagText}>{feature}</Text>
          </View>
        ))}
      </View>
    </View>
  </TouchableOpacity>
);

// Category Filter Component
const CategoryFilter = ({ categories, selectedCategory, onSelectCategory }) => (
  <ScrollView 
    horizontal 
    showsHorizontalScrollIndicator={false}
    style={styles.categoryContainer}
    contentContainerStyle={styles.categoryContent}
  >
    {categories.map((category) => (
      <TouchableOpacity
        key={category.id}
        style={[
          styles.categoryButton,
          selectedCategory === category.id && styles.categoryButtonActive
        ]}
        onPress={() => onSelectCategory(category.id)}
      >
        <Text style={styles.categoryIcon}>{category.icon}</Text>
        <Text style={[
          styles.categoryText,
          selectedCategory === category.id && styles.categoryTextActive
        ]}>
          {category.name}
        </Text>
      </TouchableOpacity>
    ))}
  </ScrollView>
);

// Main App Component
const App = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [products, setProducts] = useState(SAMPLE_PRODUCTS);
  const [loading, setLoading] = useState(false);
  const [aiAnalyzing, setAiAnalyzing] = useState(false);

  // Filter products based on search and category
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || 
                           product.category.toLowerCase().includes(selectedCategory);
    return matchesSearch && matchesCategory;
  });

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query.length > 2) {
      setLoading(true);
      try {
        const results = await AIService.searchProducts(query);
        setProducts([...SAMPLE_PRODUCTS, ...results]);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleProductPress = async (product) => {
    setAiAnalyzing(true);
    try {
      const aiAnalysis = await AIService.analyzeProductEcoScore(product);
      Alert.alert(
        `${product.name} - Eco Analysis`,
        `Eco Score: ${aiAnalysis.ecoScore}\nSentiment: ${aiAnalysis.sentiment}\n\nInsights:\n${aiAnalysis.sustainabilityInsights.join('\n')}`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Analysis Error', 'Could not analyze product at this time.');
    } finally {
      setAiAnalyzing(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1B5E20" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoIcon}>🌱</Text>
            <Text style={styles.logoText}>EcoFinder</Text>
          </View>
          <Text style={styles.headerSubtitle}>
            AI-Powered Sustainable Shopping
          </Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search eco-friendly products..."
            placeholderTextColor="#81C784"
            value={searchQuery}
            onChangeText={handleSearch}
          />
          {aiAnalyzing && (
            <View style={styles.aiIndicator}>
              <Text style={styles.aiIndicatorText}>🤖</Text>
            </View>
          )}
        </View>
      </View>

      {/* Categories */}
      <CategoryFilter
        categories={CATEGORIES}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      {/* Results Header */}
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsText}>
          {filteredProducts.length} Eco-Friendly Products Found
        </Text>
        <TouchableOpacity style={styles.sortButton}>
          <Text style={styles.sortButtonText}>⚡ Eco Score</Text>
        </TouchableOpacity>
      </View>

      {/* Products List */}
      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        renderItem={({ item }) => (
          <ProductCard product={item} onPress={handleProductPress} />
        )}
        contentContainerStyle={styles.productsList}
        showsVerticalScrollIndicator={false}
      />

      {/* AI Footer */}
      <View style={styles.aiFooter}>
        <Text style={styles.aiFooterText}>
          🤖 Powered by AI • Sustainability Insights • Real-time Analysis
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F8E9',
  },
  header: {
    backgroundColor: '#1B5E20',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  headerContent: {
    alignItems: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  logoIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  logoText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#C8E6C9',
    textAlign: 'center',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 15,
    elevation: 4,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  searchIcon: {
    fontSize: 20,
    marginRight: 15,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#2E7D32',
  },
  aiIndicator: {
    backgroundColor: '#4CAF50',
    borderRadius: 15,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  aiIndicatorText: {
    fontSize: 14,
  },
  categoryContainer: {
    marginBottom: 20,
  },
  categoryContent: {
    paddingHorizontal: 20,
  },
  categoryButton: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginRight: 15,
    backgroundColor: 'white',
    borderRadius: 20,
    minWidth: 100,
    elevation: 2,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  categoryButtonActive: {
    backgroundColor: '#4CAF50',
  },
  categoryIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2E7D32',
  },
  categoryTextActive: {
    color: 'white',
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  resultsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E7D32',
  },
  sortButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  sortButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  productsList: {
    paddingHorizontal: 10,
    paddingBottom: 80,
  },
  row: {
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  productCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 15,
    marginVertical: 10,
    width: (width / 2) - 25,
    elevation: 4,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  productImageContainer: {
    position: 'relative',
    alignItems: 'center',
    marginBottom: 12,
  },
  productImagePlaceholder: {
    width: 80,
    height: 80,
    backgroundColor: '#E8F5E8',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productImageText: {
    fontSize: 30,
  },
  ecoScoreBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#2E7D32',
    borderRadius: 15,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  ecoScoreBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  productInfo: {
    alignItems: 'flex-start',
  },
  productName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 4,
  },
  productCategory: {
    fontSize: 12,
    color: '#81C784',
    marginBottom: 6,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1B5E20',
    marginBottom: 6,
  },
  productRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingText: {
    fontSize: 12,
    marginRight: 4,
  },
  reviewCount: {
    fontSize: 10,
    color: '#81C784',
  },
  sustainabilityTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  sustainabilityTag: {
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginRight: 4,
    marginBottom: 2,
  },
  sustainabilityTagText: {
    fontSize: 8,
    color: '#2E7D32',
    fontWeight: '600',
  },
  ecoScoreContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },
  ecoScoreCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  ecoScoreNumber: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  ecoScoreLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  aiFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#2E7D32',
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  aiFooterText: {
    color: 'white',
    fontSize: 12,
    textAlign: 'center',
  },
});

export default App;
