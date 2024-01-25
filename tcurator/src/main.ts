import '@/utils/neo4j/log_patch'
import { setupConstraints, setupIndexes } from "./neo4j";
import { sentry } from "./sentry";
import "./models/__relations"
import { setupRmq } from "./rmq";
import { setupScheduledJobs } from "./jobs";
import { logger } from "./utils/logger";
import { Add, And, Gt, IsOdd, Lt, Divide } from 'ts-arithmetic';
import { Channel, ChannelInstance } from './models/channel';

const _ = <T>() => new Proxy({}, {
    get(_, str) {
       return i => i[str]()
    }
  }) as {[ K in keyof T]: (it: T) => T[K]}



const oks =_<ChannelInstance>().getChannelAddedBy



type Specifiers = {
    's': string,
    'd': number,
    'b': boolean,
    'D': Date
};

type Spec = keyof Specifiers;
type Values<T extends string> =
    T extends `${infer _}%${infer K}${infer Rest}`
    ? K extends Spec
        ? [ Specifiers[K], ...Values<Rest> ]
        : Values<`${K}${Rest}`>
    : [];

declare function printf<T extends string>(format: T, ...values: Values<T>): string;


function oka() {
    // printf("sdkfkd %s %d %d")
}
//TODO

//never use QueryRunner.getResultProperties<SessionProps>
/// use =>.record.map(it=recordToObject(it.c))

async function main() {
    try {
        logger.info('starting main')
        await setupConstraints()
        logger.info('constraints setup done')

        await setupIndexes()
        logger.info('indexes setup done')

        const rmq = await setupRmq()
        logger.info('rmq setup done')

        await setupScheduledJobs(rmq)
        logger.info('start jobs')

    } catch (e) {
        logger.error(e)
        sentry.captureException(e)
    }
}

main()

type MAX_SAFE_INTEGER = 9007199254740991
// Number.MAX_SAFE_INTEGER

type IsOddAndSafe<T extends number> = And<Lt<T, MAX_SAFE_INTEGER>, IsOdd<T>>




type ExtractTime<T>
    = T extends `${infer Hour extends bigint}:${infer Minute extends bigint}`
    ? Time<
        CastBigintToNumber<Hour>,
        CastBigintToNumber<Minute>
    >
    : never;


type HoursConstraint<T extends number> = And<Lt<T, 24>, Gt<T, -1>>
type MinutesConstraint<T extends number> = And<Lt<T, 60>, Gt<T, -1>>

type Time<A, B> = { hours: A, minutes: B }

type TrueOrError<V, T, E> = T & (V extends 1 ? T : { error: E })

function parseTime<
    I extends string,
    R extends Time<number, number> = ExtractTime<I>,
    H extends number = R['hours'],
    M extends number = R['minutes'],
>(t: I
    & TrueOrError<HoursConstraint<H>, string, 'hours must be number from 0 to 24'>
    & TrueOrError<MinutesConstraint<M>, string, 'minutes must be number from 0 to 60'>
): R {
    throw ''
}

parseTime('20:44')

type cd<T extends string> = typeof parseTime<T>




// parseTime('203:46')


type R<C> = C extends `${infer Hour extends bigint}:${infer Minute extends bigint}` ? 1 : 12

function lll<C extends 0>(r: C) {

}

type CastBigintToNumber<
    T extends bigint
>
    =
    `${T}` extends `${infer N extends number}`
    ? N : never






type F = CastBigintToNumber<3n>

type a = ExtractTime<'3:3'>

type c = 123

function ok<T extends number>(num: TrueOrError<IsOddAndSafe<T>, T, 'safe int odd expected'>) {
    ok(1300000000100001);
    ok(6000000009099991);
    ok(6000000209099991);
    ok(6000000009099991);
    ok(6000000009099991);
    ok(6000003009099991);
    ok(6000000009099991);
    // ok(6000010009099990);
    ok(6000000009099991);
    ok(6000000009099991);
    ok(6000000009099991);
    ok(6000003009099991);
    ok(6000040009099991);
    ok(6000000009099991);

    ok(7);



}

type cobra = Divide<Add<1, 2>, 2>
type ff = { [f in 1 | 2] }


type NewKeyType = string | 0

type MappedTypeWithNewProperties<Type> = {
    [Properties in keyof Type as NewKeyType]: Type[Properties]
}

namespace time {




    type StringChars<Str extends string, Acc extends string[] = []> =
        Str extends `${infer First}${infer Rest}`
        ? StringChars<Rest, [...Acc, First]>
        : Acc;

    type ArrayToUnion<A> = A extends Array<infer T> ? T : never;

    type Digits = ArrayToUnion<StringChars<'0123456789'>>


    type MinutesDigits = ArrayToUnion<StringChars<'012345'>>
    type Hours = '20' | '21' | '22' | '23' | `${0 | 1}${Digits}`
    type Time = `${Hours}:${MinutesDigits}${Digits}`


    type Alhpa = ArrayToUnion<StringChars<'qwertyuiop[]asdfghjkl;zxcvbnm,./'>>
    type IATA = `${Alhpa}${Alhpa}`

    type SPAM<T extends string = Time> = `${Time}`
    function parseTime(t: SPAM) {
        parseTime('08:10')


        parseTime('00:00')
    }























}



















type Num = 'a' | 'b' | '' | ' '
type CC = `${Num}${Num}${Num}${Num}${Num}`


type Ff = typeof getA

function getA<
    X,
>(c: `${Num}${1}`): '' {
    throw ''
}

function fsdfs(cc: CC) {
    fsdfs('')
}
