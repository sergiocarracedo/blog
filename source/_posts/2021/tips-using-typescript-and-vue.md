---
title: Tips using Typescript and Vue 
date: 2021-04-25
permalink: tips-using-typescript-and-vue/
cover: 
---
Typescript is great "language", makes possible creating more maintainable and understandable software, but requires extra effort to type the variables, the functions arguments, etc...

Vue 2.x, and even more Vue 3 provide a great typescript integration, providing the necessary types to use your app, but not always are trivial, and you need to know tye types you must use in every case.

I want to share with all of you the lessons I learnt in my experience using Vue and TS, the typical questions, and "problems" I found in the way.

## Vuex
Typing the Vuex's store can't be straight forward, my first time typing the store was frustrating because I didn't was types use.

#### State
The state is a JS object, in type you can type it as a generic `Record<string, any>` but this is not nice. It's better creating and interface that define all the store items types, for example, imagine this store:
```js
const store = {
  name: 'Sergio',
  lastLogin: new Date(2021, 0, 1, 22, 34),
  config: {
    darkTheme: true,
    fontSize: 23
  },
  friends: [{ id: 1, name: 'Juan' }, { id: 2, name: 'Felipe' }]
}
```
We must create an interface for this object:
```ts
interface Friend {
  id: number;
  name: string;
}
interface StoreState {
  name: string;
  lastLogin?: Date,
  config: {
    darkTheme: boolean;
    fontSize: number;
  },
  friends: Friend[]
}
const store: StoreState = {
  name: 'Sergio',
  lastLogin: new Date(2021, 0, 1, 22, 34),
  config: {
    darkTheme: true,
    fontSize: 23
  },
  friends: [{ id: 1, name: 'Juan' }, { id: 2, name: 'Felipe' }]
}
```

#### Mutations
For the mutations, Vuex provides the type `MutationTree<S>`, defined as:

```ts
interface MutationTree<S> {
    [key: string]: Mutation<S>;
}
type Mutation<S> = (state: S, payload?: any) => any;
```

Basically, is a map of mutation functions, as you can see, a mutation function get the state type but payload can be anything and return anything

```ts
const mutations: MutationTree<StoreState> = {
    setName (store, payload: string) {
        store.name = payload
    }
}
```
> As the payload is defined by the type as `any` it's a good practice type your payload in every mutation function

#### Actions
It's similar to the mutations, but with a peculiarity:

```ts
interface ActionTree<S, R> {
    [key: string]: Mutation<S, R>;
}
type Action<S, R> = ActionHandler<S, R> | ActionObject<S, R>;
```

Without go deeper, the `S` is the state of the vuex module, and `R` is the **Root State**. In a simple case (without using vuex modules) `S` and `R` are the same.

#### Getters
Same as actions, 
```ts
interface GetterTree<S, R> {
    [key: string]: Getter<S, R>;
}
```

For example:
```ts
const getters: GetterTree<StoreState, StoreState> = {
    friendCount(store): number {
      return store.friends.length
    }
}
```
> As in the store payload params, it's a good practice to type getter return

## Composition API
If you are using composition API in the setup function we can type our properties as we did in the store. Make sure you are using `defineComponent` instead `Vue.extend` to make it work

```ts
interface Props {
    value: boolean,
    title: string    
}

export default defineComponent({
    name: 'my-component',
    props: {
        value: Boolean,
        title: String        
    },
    setup (props: Props) {
     ...
    }
})
```

You can also type the properties in the `props` entry, but as **typescript interfaces don't exist at runtime** we can't use the interface directly as the property type

```ts
// Doesn't work because Friend doen't exists in runtime
{
  props: {
    friend: {
      type: Friend
    }
  }
}
// Doesn't work because Object doesn't implement Friend properties
{
  props: {
    friend: {
      type: Object as Friend
    }
  }
}
```
But, we can pass the type as return of a function, then Vue instance the interface instances the interface and can check the value type

```ts
// Works
{
  props: {
    friend: Object as () => Friend,
    friends: Array as () => Friend[]
  }
}
```
[Read more about that](https://frontendsociety.com/using-a-typescript-interfaces-and-types-as-a-prop-type-in-vuejs-508ab3f83480)

## Add extra entries to Vue object



