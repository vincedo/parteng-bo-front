import { TestBed } from '@angular/core/testing';
import 'reflect-metadata';
import { HALDeserializeFrom, HALSerializeTo, HALSerializerService } from './hal-serializer.service';

class TestPhone {
  @HALDeserializeFrom()
  @HALSerializeTo()
  number!: string;
  @HALDeserializeFrom()
  noEmbed!: string;
}

class Zip {
  @HALDeserializeFrom()
  @HALSerializeTo()
  name!: string;
  @HALDeserializeFrom()
  @HALSerializeTo()
  code!: string;
}

class TestAddress {
  @HALDeserializeFrom()
  @HALSerializeTo()
  street!: string;
  @HALDeserializeFrom()
  @HALSerializeTo()
  city!: string;
  @HALDeserializeFrom()
  state!: string;
  @HALDeserializeFrom()
  @HALSerializeTo()
  zip!: Zip;
  @HALDeserializeFrom('phones', TestPhone)
  phones!: TestPhone[];
}

class Department {
  @HALSerializeTo()
  name!: string;
}

class TestUser {
  @HALDeserializeFrom()
  @HALSerializeTo()
  name!: string;
  @HALDeserializeFrom()
  age!: number;
  @HALDeserializeFrom()
  @HALSerializeTo('some_address')
  address!: TestAddress;
  @HALDeserializeFrom()
  @HALSerializeTo()
  phone!: TestPhone;
  @HALDeserializeFrom()
  notInEmbed!: string;
  @HALSerializeTo()
  departments!: Department[];
}

const testHal = {
  name: 'Antoine',
  age: 46,
  _embedded: {
    address: {
      street: 'test street',
      state: null,
      city: 'test city',
      _embedded: {
        phones: [{ number: '1234' }, { number: '5678' }],
      },
    },
  },
  _links: {
    self: {
      href: 'test href',
    },
  },
};

describe('SerializerService', () => {
  let service: HALSerializerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HALSerializerService);
    jest.resetAllMocks();
  });

  it('should serialize', () => {
    const testZip = new Zip();
    testZip.name = 'test zip name';
    testZip.code = 'test zip code';

    const testAddress = new TestAddress();
    testAddress.street = 'test address street';
    testAddress.city = 'test address city';
    testAddress.zip = testZip;

    const testPhone = new TestPhone();
    testPhone.number = 'test phone number';
    testPhone.noEmbed = 'test phone no embed';

    const department1 = new Department();
    department1.name = 'test department 1';
    const department2 = new Department();
    department2.name = 'test department 2';

    const testUser = new TestUser();
    testUser.name = 'test user name';
    testUser.address = testAddress;
    testUser.phone = testPhone;
    testUser.departments = [department1, department2];

    const hal: any = service.serialize(testUser);

    expect(hal['name']).toEqual(testUser.name);
    expect(hal['_embedded']['some_address']['street']).toEqual(testAddress.street);
    expect(hal['_embedded']['some_address']['city']).toEqual(testAddress.city);
    expect(hal['_embedded']['some_address']['_embedded']['zip']['name']).toEqual(testZip.name);
    expect(hal['_embedded']['some_address']['_embedded']['zip']['code']).toEqual(testZip.code);
    expect(hal['_embedded']['phone']['number']).toEqual(testPhone.number);
    expect(hal['_embedded']['departments'][0]['name']).toEqual(department1.name);
    expect(hal['_embedded']['departments'][1]['name']).toEqual(department2.name);
  });

  it('should deserialize', () => {
    const user: TestUser = service.deserialize<TestUser>(testHal, TestUser);
    expect(user.name).toBe(testHal.name);
    expect(user.age).toBe(testHal.age);
    // tslint:disable-next-line
    expect(user.address.street).toBe((testHal._embedded.address as any).street);
    // tslint:disable-next-line
    expect(user.address.city).toBe((testHal._embedded.address as any).city);
    // expect(user.address.state).toBe('');
    expect(user.address.phones.length).toBe(2);
    expect(user.address.phones[0].number).toBe('1234');
    expect(user.address.phones[1].number).toBe('5678');
  });

  // it('should convert null to empty string', () => {
  //   const user: TestUser = service.deserialize<TestUser>(testHal, TestUser);
  //   expect(user.name).toBe(testHal.name);
  //   expect(user.age).toBe(testHal.age);
  //   // tslint:disable-next-line
  //   expect(user.address.street).toBe((testHal._embedded.address as any).street);
  //   // tslint:disable-next-line
  //   expect(user.address.city).toBe((testHal._embedded.address as any).city);
  //   expect(user.address.phones.length).toBe(2);
  //   expect(user.address.phones[0].number).toBe('1234');
  //   expect(user.address.phones[1].number).toBe('5678');
  // });

  it('should fail deserialize when missing array item', () => {
    expect(() => {
      class TestUserInvalid {
        @HALDeserializeFrom('items')
        items!: number[];
      }
    }).toThrow();
  });
});
