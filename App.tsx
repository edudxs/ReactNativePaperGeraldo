import * as React from "react";
import { useEffect, useState } from "react";
import { FlatList, Image, StyleSheet, View } from "react-native";
import {
  ActivityIndicator,
  Appbar,
  Card,
  Provider as PaperProvider,
  Searchbar,
  Text,
} from "react-native-paper";
import { NavigationContainer } from "@react-navigation/native";
import {
  NativeStackScreenProps,
  createNativeStackNavigator,
} from "@react-navigation/native-stack";
import { SafeAreaView } from "react-native-safe-area-context";

// ---------- TIPOS ----------

type Product = {
  id: number;
  title: string;
  brand: string;
  price: number;
  description: string;
  thumbnail: string;
};

type RootStackParamList = {
  Home: undefined;
  Details: { product: Product };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const API_URL = "https://dummyjson.com/products";

// ---------- TELAS ----------

function HomeScreen({
  navigation,
}: NativeStackScreenProps<RootStackParamList, "Home">) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  async function loadProducts() {
    try {
      setLoading(true);
      const res = await fetch(API_URL);

      if (!res.ok) {
        console.log("Erro HTTP:", res.status);
        setProducts([]);
        return;
      }

      const json = await res.json();
      // A API retorna { products: [...] }
      const list: Product[] = json?.products ?? [];

      setProducts(list);
    } catch (e) {
      console.log("Erro ao carregar produtos:", e);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  const filtered = query
    ? products.filter((p) =>
        p.title.toLowerCase().includes(query.toLowerCase()),
      )
    : products;

  return (
    <SafeAreaView style={styles.safe}>
      <Appbar.Header>
        <Appbar.Content
          title="Catálogo de Produtos"
          subtitle="Desafio 2 • API pública + Paper"
        />
      </Appbar.Header>

      <View style={styles.container}>
        <Searchbar
          placeholder="Buscar produto..."
          value={query}
          onChangeText={setQuery}
          style={styles.search}
        />

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator animating size="large" />
            <Text style={styles.muted}>Carregando produtos...</Text>
          </View>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={
              filtered.length === 0 ? styles.centerList : undefined
            }
            ListEmptyComponent={
              <Text style={styles.muted}>
                Nenhum produto encontrado para essa busca.
              </Text>
            }
            renderItem={({ item }) => (
              <Card
                style={styles.card}
                mode="elevated"
                onPress={() =>
                  navigation.navigate("Details", { product: item })
                }
              >
                <Card.Title
                  title={item.title}
                  subtitle={item.brand}
                  left={() => (
                    <Image
                      source={{ uri: item.thumbnail }}
                      style={styles.thumb}
                    />
                  )}
                />
                <Card.Content>
                  <Text variant="bodySmall" numberOfLines={2}>
                    {item.description}
                  </Text>
                  <Text style={styles.price}>
                    R$ {item.price.toFixed(2).replace(".", ",")}
                  </Text>
                </Card.Content>
              </Card>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

function DetailsScreen({
  route,
  navigation,
}: NativeStackScreenProps<RootStackParamList, "Details">) {
  const { product } = route.params;

  return (
    <SafeAreaView style={styles.safe}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title={product.title} />
      </Appbar.Header>

      <View style={styles.detailsContainer}>
        <Card style={styles.detailsCard} mode="elevated">
          <Card.Cover source={{ uri: product.thumbnail }} />
          <Card.Content style={styles.detailsContent}>
            <Text variant="titleMedium" style={styles.detailsTitle}>
              {product.title}
            </Text>

            <Text style={styles.detailsText}>
              <Text style={styles.detailsLabel}>Marca: </Text>
              {product.brand}
            </Text>

            <Text style={styles.detailsText}>
              <Text style={styles.detailsLabel}>Preço: </Text>
              R$ {product.price.toFixed(2).replace(".", ",")}
            </Text>

            <Text style={[styles.detailsText, { marginTop: 8 }]}>
              <Text style={styles.detailsLabel}>Descrição: </Text>
              {product.description}
            </Text>

            <Text style={[styles.muted, { marginTop: 12 }]}>
              Dados fornecidos pela API pública{" "}
              <Text style={styles.detailsLabel}>dummyjson.com</Text>.
            </Text>
          </Card.Content>
        </Card>
      </View>
    </SafeAreaView>
  );
}

// ---------- APP ROOT ----------

export default function App() {
  return (
    <PaperProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Details" component={DetailsScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}

// ---------- ESTILOS ----------

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F3F4FB",
  },
  container: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 8,
  },
  search: {
    marginBottom: 8,
    borderRadius: 999,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  centerList: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  muted: {
    marginTop: 8,
    color: "#6B7280",
    textAlign: "center",
  },
  card: {
    marginVertical: 4,
  },
  thumb: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginLeft: 8,
    backgroundColor: "#E5E7EB",
  },
  price: {
    marginTop: 4,
    fontWeight: "700",
    color: "#16A34A",
  },
  detailsContainer: {
    flex: 1,
    padding: 16,
  },
  detailsCard: {
    flex: 1,
  },
  detailsContent: {
    marginTop: 12,
    gap: 4,
  },
  detailsTitle: {
    marginBottom: 8,
  },
  detailsText: {
    fontSize: 14,
  },
  detailsLabel: {
    fontWeight: "600",
  },
});
