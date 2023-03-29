import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import {styles} from "./styles";

const SearchableDropdownWrapper = ({ style, onItemSelect, options }) => {
  const [query, setQuery] = useState('');
  const [filteredOptions, setFilteredOptions] = useState(options);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    setFilteredOptions(
      options.filter((option) =>
        option.toLowerCase().includes(query.toLowerCase())
      )
    );
  }, [query]);

  const handleItemSelect = (item) => {
    setSelectedItem(item);
    onItemSelect(item);
    setQuery(`selected: ${item}`);
  };

  return (
    <View style={style}>
      <TextInput
        style={styles.input}
        value={query}
        placeholder="Search"
        onChangeText={(text) => setQuery(text)}
      />
      {filteredOptions.length > 0 && (
        <FlatList
          data={filteredOptions}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.item}
              onPress={() => handleItemSelect(item)}
            >
              <Text>{item}</Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item}
          style={styles.list}
        />
      )}
    </View>
  );
};

export default SearchableDropdownWrapper;
