#include <iostream>
#include <set>
#include <string>
#include <vector>
#include <algorithm> // For sorting
#include "App.h"
#include <curl/curl.h>
#include <json.hpp> // for JSON handling
#include "crow_all.h"
// ^ Crow is a C++ framework for creating HTTP or Websocket web services


using json = nlohmann::json;
using namespace std;


// EVERYTHING SHOULD WORK IN THEORY
// the crow and json stuff has not been working for me so i cant test it

class Business {
private:
    string name;
    string address;
    string rating;
    string contact;
    string description;
    vector<pair<string, string>> reviews; // review and date of review
    int price;
    string type;
public:
    // constructors
    Business(string name, int price, string type, string description = "No description available")
        : name(name), price(price), type(type), rating("Not Rated"), description(description) {}
    Business(string name, int price, string type, string address, string contact, string description = "No description available")
        : name(name), price(price), type(type), address(address), contact(contact), rating("Not Rated"), description(description) {}
   
    // getters
    string getName() const { return name; }
    string getAddress() const { return address; }
    string getType() const { return type; }
    string getContact() const { return contact; }
    string getRating() const {return rating;}
    string getDescription() const { return description; }
    int getPrice() const { return price; }
    const vector<pair<string, string>>& getReviews() const { return reviews; }
    
    //setter functions
    void setProductType(const string& prodType){
        type=prodType;
    }
    void setAddress(const string& newAddress) {
        address = newAddress;
    }
    void addReview(const string& review, const string& date){
        reviews.push_back(make_pair(review, date));
    }
    void setContact(const string& newContact) {
        contact = newContact;
    }
    void setRating(const string& r){
        rating=r;
    }
    void setDescription(const string& desc) {
        description = desc;
    }
};

int main() {
    crow::SimpleApp app;

    // Vector to store businesses (simulating a database)
    vector<Business> businesses;
    
    // Initialize some sample businesses
    Business b1("Cafe", 10, "Coffee", "123 Cafe St", "555-1234", "A cozy cafe serving fresh coffee and pastries.");
    Business b2("Bakery", 20, "Desserts", "456 Bakery Ln", "555-5678", "A bakery offering fresh bread and cakes.");
    Business b3("Tech Store", 100, "Electronics", "789 Tech Blvd", "555-9876", "A tech store with the latest gadgets.");
    
    // Add sample data
    b1.setRating("4 Stars");
    b2.setRating("5 Stars");
    b3.setRating("3 Stars");
    
    businesses = {b1, b2, b3};

    // GET endpoint for all businesses
    CROW_ROUTE(app, "/businesses")
    ([&businesses]() {
        json response = json::array();
        for (const auto& business : businesses) {
            json businessJson = {
                {"name", business.getName()},
                {"type", business.getType()},
                {"price", business.getPrice()},
                {"address", business.getAddress()},
                {"contact", business.getContact()},
                {"rating", business.getRating()},
                {"description", business.getDescription()}
            };
            response.push_back(businessJson);
        }
        return crow::response{response.dump()};
    });

    // GET endpoint for specific business by name
    CROW_ROUTE(app, "/businesses/<string>")
    ([&businesses](string name) {
        auto it = find_if(businesses.begin(), businesses.end(),
            [&name](const Business& b) { return b.getName() == name; });
        
        if (it != businesses.end()) {
            json businessJson = {
                {"name", it->getName()},
                {"type", it->getType()},
                {"price", it->getPrice()},
                {"address", it->getAddress()},
                {"contact", it->getContact()},
                {"rating", it->getRating()},
                {"description", it->getDescription()}
            };
            return crow::response{businessJson.dump()};
        }
        return crow::response(404, "Business not found");
    });

    // Start the server on port 8080
    app.port(8080).multithreaded().run();
    return 0;
}
